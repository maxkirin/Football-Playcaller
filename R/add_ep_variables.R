library(tidyverse)

#' Calculate and add the expected points variables to include in a `nflscrapR`
#' play-by-play data frame
#'
#' Given a `nflscrapR` play-by-play data frame, calculate the expected points
#' for a play using the `nflscrapR` expected points model and include
#' the columns to the input data frame. See here for an explanation of the
#' model methodology: \url{https://arxiv.org/abs/1802.00998}. Source code for
#' fitting the model is located here \url{https://github.com/ryurko/nflscrapR-models/blob/master/R/init_models/init_ep_fg_models.R}.
#'
#' @param pbp_data Data frame with all of the necessary columns used to estimate
#' the expected points for a play.
#' @return The input data frame with additional columns included for the
#' expected points (ep), no score probability (no_score_prob), opponent field
#' goal probability (opp_fg_prob), opponent safety probability (opp_safety_prob),
#' opponent TD probability (opp_td_prob), own field goal probability (fg_prob),
#' own safety probability (safety_prob), own TD probability (td_prob), as well
#' as the expected points added (epa) and cumulative EPA totals for both the
#' home and away teams (total_home_epa, total_away_epa).
#' @export

add_ep_variables_adj <- function(pbp_data) {

  # The first thing to do is to temporarily rename the variables from the
  # pbp_data to match the old names of the inputs in the previous model
  # (this is done since Github has a memory limit and the old functions
  # will not be deprecated until after the 2018-19 season):
  pbp_data <- pbp_data %>%
    dplyr::rename(play_type = PlayType) %>%
    # Next make the modifications to use the rest of the
    dplyr::mutate(down = factor(down),
                  log_ydstogo = log(ydstogo),
                  Under_TwoMinute_Warning = dplyr::if_else(TimeSecs_Remaining < 120,
                                                           1, 0))

  # Next follows the original process for generating the expected points columns
  # with slight modifications to handle the play types:

  # Define the predict_EP_prob() function:
  # INPUT:  - data: play-by-play dataset
  #         - ep_model: multinom EP model to predict probabilities
  #                     of the next scoring event for basic plays
  #         - fg_model: bam FG model to predict FG success rate
  # OUTPUT: - play-by-play dataset with predicted probabilities for
  #           each of the type of next scoring events, and additionally
  #           the probability of the PAT attempts

  predict_EP_prob <- function(data, ep_model, fgxp_model){
    # First get the predictions from the base ep_model:
    if (nrow(data) > 1) {
      base_ep_preds <- as.data.frame(predict(ep_model, newdata = data, type = "probs"))
    } else{
      base_ep_preds <- as.data.frame(matrix(predict(ep_model, newdata = data, type = "probs"),
                                            ncol = 7))
    }
    colnames(base_ep_preds) <- c("No_Score","Opp_Field_Goal","Opp_Safety","Opp_Touchdown",
                                 "Field_Goal","Safety","Touchdown")
    # ----------------------------------------------------------------------------
    # Now make another dataset that to get the EP probabilities from a missed FG:
    missed_fg_data <- data
    # Subtract 5.065401 from TimeSecs:
    missed_fg_data$TimeSecs_Remaining <- missed_fg_data$TimeSecs_Remaining - 5.065401

    # Correct the yrdline100:
    missed_fg_data$yrdline100 <- 100 - (missed_fg_data$yrdline100 + 8)
    # Not GoalToGo:
    missed_fg_data$GoalToGo <- rep(0,nrow(data))
    # Now first down:
    missed_fg_data$down <- rep("1",nrow(data))
    # 10 ydstogo:
    missed_fg_data$ydstogo <- rep(10,nrow(data))
    # Create log_ydstogo:
    missed_fg_data <- dplyr::mutate(missed_fg_data, log_ydstogo = log(ydstogo))

    # Create Under_TwoMinute_Warning indicator
    missed_fg_data$Under_TwoMinute_Warning <- ifelse(missed_fg_data$TimeSecs_Remaining < 120,1,0)

    # Get the new predicted probabilites:
    if (nrow(missed_fg_data) > 1) {
      missed_fg_ep_preds <- as.data.frame(predict(ep_model, newdata = missed_fg_data, type = "probs"))
    } else{
      missed_fg_ep_preds <- as.data.frame(matrix(predict(ep_model, newdata = missed_fg_data, type = "probs"),
                                                 ncol = 7))
    }
    colnames(missed_fg_ep_preds) <- c("No_Score","Opp_Field_Goal","Opp_Safety","Opp_Touchdown",
                                      "Field_Goal","Safety","Touchdown")
    # Find the rows where TimeSecs_Remaining became 0 or negative and make all the probs equal to 0:
    end_game_i <- which(missed_fg_data$TimeSecs_Remaining <= 0)
    missed_fg_ep_preds[end_game_i,] <- rep(0,ncol(missed_fg_ep_preds))

    # Get the probability of making the field goal:
    make_fg_prob <- as.numeric(mgcv::predict.bam(fgxp_model, newdata= data, type="response"))

    # Multiply each value of the missed_fg_ep_preds by the 1 - make_fg_prob
    missed_fg_ep_preds <- missed_fg_ep_preds * (1 - make_fg_prob)
    # Find the FG attempts:
    fg_attempt_i <- which(data$play_type == "Field Goal")

    # Now update the probabilities for the FG attempts (also includes Opp_Field_Goal probability from missed_fg_ep_preds)
    base_ep_preds[fg_attempt_i, "Field_Goal"] <- make_fg_prob[fg_attempt_i] + missed_fg_ep_preds[fg_attempt_i,"Opp_Field_Goal"]
    # Update the other columns based on the opposite possession:
    base_ep_preds[fg_attempt_i, "Touchdown"] <- missed_fg_ep_preds[fg_attempt_i,"Opp_Touchdown"]
    base_ep_preds[fg_attempt_i, "Opp_Field_Goal"] <- missed_fg_ep_preds[fg_attempt_i,"Field_Goal"]
    base_ep_preds[fg_attempt_i, "Opp_Touchdown"] <- missed_fg_ep_preds[fg_attempt_i,"Touchdown"]
    base_ep_preds[fg_attempt_i, "Safety"] <- missed_fg_ep_preds[fg_attempt_i,"Opp_Safety"]
    base_ep_preds[fg_attempt_i, "Opp_Safety"] <- missed_fg_ep_preds[fg_attempt_i,"Safety"]
    base_ep_preds[fg_attempt_i, "No_Score"] <- missed_fg_ep_preds[fg_attempt_i,"No_Score"]

    # ----------------------------------------------------------------------------------
    # Calculate the EP for receiving a touchback (from the point of view for recieving team)
    # and update the columns for Kickoff plays:
    kickoff_data <- data

    # Change the yard line to be 80 for 2009-2015 and 75 otherwise
    # (accounting for the fact that Jan 2016 is in the 2015 season:
    kickoff_data$yrdline100 <- with(kickoff_data,
                                    ifelse(Season < 2016,
                                           80, 75))
    # Not GoalToGo:
    kickoff_data$GoalToGo <- rep(0,nrow(data))
    # Now first down:
    kickoff_data$down <- rep("1",nrow(data))
    # 10 ydstogo:
    kickoff_data$ydstogo <- rep(10,nrow(data))
    # Create log_ydstogo:
    kickoff_data <- dplyr::mutate(kickoff_data, log_ydstogo = log(ydstogo))

    # Get the new predicted probabilites:
    if (nrow(kickoff_data) > 1) {
      kickoff_preds <- as.data.frame(predict(ep_model, newdata = kickoff_data, type = "probs"))
    } else{
      kickoff_preds <- as.data.frame(matrix(predict(ep_model, newdata = kickoff_data, type = "probs"),
                                            ncol = 7))
    }
    colnames(kickoff_preds) <- c("No_Score","Opp_Field_Goal","Opp_Safety","Opp_Touchdown",
                                 "Field_Goal","Safety","Touchdown")
    # Find the kickoffs:
    kickoff_i <- which(data$play_type == "Kickoff")

    # Now update the probabilities:
    base_ep_preds[kickoff_i, "Field_Goal"] <- kickoff_preds[kickoff_i, "Field_Goal"]
    base_ep_preds[kickoff_i, "Touchdown"] <- kickoff_preds[kickoff_i, "Touchdown"]
    base_ep_preds[kickoff_i, "Opp_Field_Goal"] <- kickoff_preds[kickoff_i, "Opp_Field_Goal"]
    base_ep_preds[kickoff_i, "Opp_Touchdown"] <- kickoff_preds[kickoff_i, "Opp_Touchdown"]
    base_ep_preds[kickoff_i, "Safety"] <- kickoff_preds[kickoff_i, "Safety"]
    base_ep_preds[kickoff_i, "Opp_Safety"] <- kickoff_preds[kickoff_i, "Opp_Safety"]
    base_ep_preds[kickoff_i, "No_Score"] <- kickoff_preds[kickoff_i, "No_Score"]

    # ----------------------------------------------------------------------------------
    # Insert probabilities of 0 for everything but No_Score for QB Kneels that
    # occur on the possession team's side of the field:
    # Find these QB Kneels:
    qb_kneels_i <- which(data$play_type == "QB Kneel" & data$yrdline100 > 50)

    # Now update the probabilities:
    base_ep_preds[qb_kneels_i, "Field_Goal"] <- 0
    base_ep_preds[qb_kneels_i, "Touchdown"] <- 0
    base_ep_preds[qb_kneels_i, "Opp_Field_Goal"] <- 0
    base_ep_preds[qb_kneels_i, "Opp_Touchdown"] <- 0
    base_ep_preds[qb_kneels_i, "Safety"] <- 0
    base_ep_preds[qb_kneels_i, "Opp_Safety"] <- 0
    base_ep_preds[qb_kneels_i, "No_Score"] <- 1


    # ----------------------------------------------------------------------------------
    # Create two new columns, ExPoint_Prob and TwoPoint_Prob, for the PAT events:
    base_ep_preds$ExPoint_Prob <- 0
    base_ep_preds$TwoPoint_Prob <- 0

    # Find the indices for these types of plays:
    extrapoint_i <- which(data$play_type == "extra_point")
    twopoint_i <- which(data$TwoPointConv == "Success" | data$TwoPointConv == "Failure")

    # Assign the make_fg_probs of the extra-point PATs:
    base_ep_preds$ExPoint_Prob[extrapoint_i] <- make_fg_prob[extrapoint_i]

    # Assign the TwoPoint_Prob with the historical success rate:
    base_ep_preds$TwoPoint_Prob[twopoint_i] <- 0.4735

    # ----------------------------------------------------------------------------------
    # Insert NAs for timeouts and end of play rows:
    missing_i <- which(data$play_type == "Quarter End" | data$play_type == "Timeout" |
                          data$play_type == "Two Minute Warning" | data$play_type == "End of Game" |
                          data$play_type == "Half End" | is.na(data$play_type))

    #missing_i <- which(data$PlayType %in% c("Quarter End", "Two Minute Warning", "Timeout",
    #                                        "End of Game", "Half End"))

    # Now update the probabilities for missing and PATs:
    base_ep_preds$Field_Goal[c(missing_i, extrapoint_i, twopoint_i)] <- 0
    base_ep_preds$Touchdown[c(missing_i, extrapoint_i, twopoint_i)] <- 0
    base_ep_preds$Opp_Field_Goal[c(missing_i, extrapoint_i, twopoint_i)] <- 0
    base_ep_preds$Opp_Touchdown[c(missing_i, extrapoint_i, twopoint_i)] <- 0
    base_ep_preds$Safety[c(missing_i, extrapoint_i, twopoint_i)] <- 0
    base_ep_preds$Opp_Safety[c(missing_i, extrapoint_i, twopoint_i)] <- 0
    base_ep_preds$No_Score[c(missing_i, extrapoint_i, twopoint_i)] <- 0

    # Rename the events to all have _Prob at the end of them:
    base_ep_preds <- dplyr::rename(base_ep_preds,
                                   Field_Goal_Prob = Field_Goal,
                                   Touchdown_Prob = Touchdown,
                                   Opp_Field_Goal_Prob = Opp_Field_Goal,
                                   Opp_Touchdown_Prob = Opp_Touchdown,
                                   Safety_Prob = Safety,
                                   Opp_Safety_Prob = Opp_Safety,
                                   No_Score_Prob = No_Score)

    # Return the final probabilities:
    return(base_ep_preds)
  }



  # Use the predict_EP_Prob on the pbp_data:
  pbp_ep_probs <- predict_EP_prob(pbp_data, ep_model_adj, fg_model_adj)

  # Join them together:
  pbp_data <- cbind(pbp_data, pbp_ep_probs)

  # Calculate the ExpPts:
  pbp_data_ep <- dplyr::mutate(pbp_data,
                               ExpPts = (0*No_Score_Prob) + (-3 * Opp_Field_Goal_Prob) +
                                 (-2 * Opp_Safety_Prob) +
                                 (-7 * Opp_Touchdown_Prob) + (3 * Field_Goal_Prob) +
                                 (2 * Safety_Prob) + (7 * Touchdown_Prob) +
                                 (1 * ExPoint_Prob) + (2 * TwoPoint_Prob))


  #################################################################

  # Calculate EPA:

  ### Adding Expected Points Added (EPA) column
  ### and Probability Touchdown Added (PTDA) column

  # Create multiple types of EPA columns
  # for each of the possible cases,
  # grouping by GameID (will then just use
  # an ifelse statement to decide which one
  # to use as the final EPA):
  pbp_data_ep %>%
    dplyr::group_by(GameID) %>%
    dplyr::mutate(# Now conditionally assign the EPA, first for possession team
      # touchdowns:
      EPA = dplyr::if_else(Touchdown == 1,
                           dplyr::if_else(Next_Score_Half == "Touchdown",
                                          7 - ExpPts, -7 - ExpPts),
                           0),
      #                     7 - ExpPts, 0),
      # Offense field goal:
      EPA = dplyr::if_else(Touchdown == 0 & FieldGoalResult == "Good",
                           3 - ExpPts, EPA),
      # Offense extra-point:
      EPA = dplyr::if_else(Touchdown == 0 & is.na(FieldGoalResult) &
                             ExPointResult == "Made",
                           1 - ExpPts, EPA),
      # Offense two-point conversion:
      EPA = dplyr::if_else(Touchdown == 0 & is.na(FieldGoalResult) &
                             is.na(ExPointResult) &
                             TwoPointConv == "Success",
                           2 - ExpPts, EPA),
      # Failed PAT (both 1 and 2):
      EPA = dplyr::if_else(Touchdown == 0 & is.na(FieldGoalResult) &
                             (ExPointResult == "Missed" | TwoPointConv == "Failure"),
                           0 - ExpPts, EPA),
      # Opponent safety:
      EPA = dplyr::if_else(Touchdown == 0 & is.na(FieldGoalResult) &
                             is.na(ExPointResult) & is.na(TwoPointConv) &
                             Safety == 1,
                           -2 - ExpPts, EPA),
      # Defense touchdown
      #not needed, touchdowns done in one if-else in first EPA calc
      #EPA = dplyr::if_else(touchdown == 1 & td_team == defteam,
      #                     -7 - ExpPts, EPA),
      # Change of possession without defense scoring
      # and no timeout, two minute warning, or quarter end follows:
      EPA = dplyr::if_else(Touchdown == 0 & is.na(FieldGoalResult) &
                             is.na(ExPointResult) & is.na(TwoPointConv) &
                             Safety == 0 &
                             Drive != dplyr::lead(Drive) &
                             posteam != dplyr::lead(posteam) &
                             !(dplyr::lead(play_type) == "Quarter End" | dplyr::lead(play_type) == "Timeout" |
                                 dplyr::lead(play_type) == "Two Minute Warning" | dplyr::lead(play_type) == "End of Game" |
                                 dplyr::lead(play_type) == "Half End" | is.na(dplyr::lead(play_type))),
                             -dplyr::lead(ExpPts) - ExpPts, EPA),
      # Same thing except for when timeouts and end of play follow:
      EPA = dplyr::if_else(Touchdown == 0 & is.na(FieldGoalResult) &
                             is.na(ExPointResult) & is.na(TwoPointConv) &
                             Safety == 0 &
                             (dplyr::lead(play_type) == "Quarter End" | dplyr::lead(play_type) == "Timeout" |
                                dplyr::lead(play_type) == "Two Minute Warning" | dplyr::lead(play_type) == "End of Game" |
                                dplyr::lead(play_type) == "Half End" | is.na(dplyr::lead(play_type))) &
                             Drive != dplyr::lead(Drive, 2) &
                             posteam != dplyr::lead(posteam, 2),
                           -dplyr::lead(ExpPts, 2) - ExpPts, EPA),
      # Same thing except for when back to back rows of end of
      # play that can potentially occur because the NFL likes to
      # make my life difficult:
      EPA = dplyr::if_else(Touchdown == 0 & is.na(FieldGoalResult) &
                             is.na(ExPointResult) & is.na(TwoPointConv) &
                             Safety == 0 &
                             ((dplyr::lead(play_type) == "Quarter End" | dplyr::lead(play_type) == "Timeout" |
                                 dplyr::lead(play_type) == "Two Minute Warning" | dplyr::lead(play_type) == "End of Game" |
                                 dplyr::lead(play_type) == "Half End" | is.na(dplyr::lead(play_type))) &
                              (dplyr::lead(play_type, 2) == "Quarter End" | dplyr::lead(play_type, 2) == "Timeout" |
                                 dplyr::lead(play_type, 2) == "Two Minute Warning" | dplyr::lead(play_type, 2) == "End of Game" |
                                 dplyr::lead(play_type, 2) == "Half End" | is.na(dplyr::lead(play_type, 2)))) &
                             Drive != dplyr::lead(Drive, 3) &
                             posteam != dplyr::lead(posteam, 3),
                           -dplyr::lead(ExpPts, 3) - ExpPts, EPA),
      # Team keeps possession and no timeout or end of play follows:
      EPA = dplyr::if_else(Touchdown == 0 & is.na(FieldGoalResult) &
                             is.na(ExPointResult) & is.na(TwoPointConv) &
                             Safety == 0 &
                             posteam == dplyr::lead(posteam) &
                             !(dplyr::lead(play_type) == "Quarter End" | dplyr::lead(play_type) == "Timeout" |
                                 dplyr::lead(play_type) == "Two Minute Warning" | dplyr::lead(play_type) == "End of Game" |
                                 dplyr::lead(play_type) == "Half End" | is.na(dplyr::lead(play_type))),
                           dplyr::lead(ExpPts) - ExpPts, EPA),
      # Same but timeout or end of play follows:
      EPA = dplyr::if_else(Touchdown == 0 & is.na(FieldGoalResult) &
                             is.na(ExPointResult) & is.na(TwoPointConv) &
                             Safety == 0 &
                             (dplyr::lead(play_type) == "Quarter End" | dplyr::lead(play_type) == "Timeout" |
                                dplyr::lead(play_type) == "Two Minute Warning" | dplyr::lead(play_type) == "End of Game" |
                                dplyr::lead(play_type) == "Half End" | is.na(dplyr::lead(play_type))) &
                             posteam == dplyr::lead(posteam, 2),
                           dplyr::lead(ExpPts, 2) - ExpPts, EPA),
      # Same as above but when two rows without play info follow:
      EPA = dplyr::if_else(Touchdown == 0 & is.na(FieldGoalResult) &
                             is.na(ExPointResult) & is.na(TwoPointConv) &
                             Safety == 0 &
                             ((dplyr::lead(play_type) == "Quarter End" | dplyr::lead(play_type) == "Timeout" |
                                 dplyr::lead(play_type) == "Two Minute Warning" | dplyr::lead(play_type) == "End of Game" |
                                 dplyr::lead(play_type) == "Half End" | is.na(dplyr::lead(play_type))) &
                              (dplyr::lead(play_type, 2) == "Quarter End" | dplyr::lead(play_type, 2) == "Timeout" |
                                 dplyr::lead(play_type, 2) == "Two Minute Warning" | dplyr::lead(play_type, 2) == "End of Game" |
                                 dplyr::lead(play_type, 2) == "Half End" | is.na(dplyr::lead(play_type, 2)))) &
                             posteam == dplyr::lead(posteam, 3),
                           dplyr::lead(ExpPts, 3) - ExpPts, EPA)) %>%
    # Now rename each of the expected points columns to match the style of
    # the updated code:
    dplyr::rename(ep = ExpPts, epa = EPA,
                  no_score_prob = No_Score_Prob,
                  opp_fg_prob = Opp_Field_Goal_Prob,
                  opp_safety_prob = Opp_Safety_Prob,
                  opp_td_prob = Opp_Touchdown_Prob,
                  fg_prob = Field_Goal_Prob,
                  safety_prob = Safety_Prob,
                  td_prob = Touchdown_Prob,
                  extra_point_prob = ExPoint_Prob,
                  two_point_conversion_prob = TwoPoint_Prob) %>%
    # Create columns with cumulative epa totals for both teams:
    dplyr::mutate(ep = dplyr::if_else(play_type == "Timeout",
                                      dplyr::lead(ep), ep),
                  epa = dplyr::if_else(play_type == "Timeout",
                                       0, epa),
                  # Change epa for plays occurring at end of half with no scoring
                  # plays to be just the difference between 0 and starting ep:
                  epa = dplyr::if_else(((qtr == 2 &
                                           (dplyr::lead(qtr) == 3 |
                                              dplyr::lead(play_type) == "Quarter End" | dplyr::lead(play_type) == "Half End")) |
                                          (qtr == 4 &
                                             (dplyr::lead(qtr) == 5 |
                                                dplyr::lead(play_type) == "Quarter End" | dplyr::lead(play_type) == "Half End"))) &
                                         sp == 0 &
                                         !(play_type == "Quarter End" | play_type == "Timeout" |
                                             play_type == "Two Minute Warning" | play_type == "End of Game" |
                                             play_type == "Half End" | is.na(play_type)),
                                       0 - ep, epa),
                  home_team_epa = dplyr::if_else(posteam == HomeTeam,
                                                 epa, -epa),
                  away_team_epa = dplyr::if_else(posteam == AwayTeam,
                                                 epa, -epa),
                  home_team_epa = dplyr::if_else(is.na(home_team_epa),
                                                 0, home_team_epa),
                  away_team_epa = dplyr::if_else(is.na(away_team_epa),
                                                 0, away_team_epa),
                  total_home_epa = cumsum(home_team_epa),
                  total_away_epa = cumsum(away_team_epa),
                  # Same thing but separating passing and rushing:
                  home_team_rush_epa = dplyr::if_else(play_type == "Run",
                                                      home_team_epa, 0),
                  away_team_rush_epa = dplyr::if_else(play_type == "Run",
                                                      away_team_epa, 0),
                  home_team_rush_epa = dplyr::if_else(is.na(home_team_rush_epa),
                                                      0, home_team_rush_epa),
                  away_team_rush_epa = dplyr::if_else(is.na(away_team_rush_epa),
                                                      0, away_team_rush_epa),
                  total_home_rush_epa = cumsum(home_team_rush_epa),
                  total_away_rush_epa = cumsum(away_team_rush_epa),
                  home_team_pass_epa = dplyr::if_else(play_type == "Pass",
                                                      home_team_epa, 0),
                  away_team_pass_epa = dplyr::if_else(play_type == "Pass",
                                                      away_team_epa, 0),
                  home_team_pass_epa = dplyr::if_else(is.na(home_team_pass_epa),
                                                      0, home_team_pass_epa),
                  away_team_pass_epa = dplyr::if_else(is.na(away_team_pass_epa),
                                                      0, away_team_pass_epa),
                  total_home_pass_epa = cumsum(home_team_pass_epa),
                  total_away_pass_epa = cumsum(away_team_pass_epa)) %>%
    dplyr::ungroup() %>%
    # Restore the original variable names and return:
    #dplyr::rename(half_seconds_remaining = TimeSecs_Remaining,
    #              yardline_100 = yrdline100,
    #              goal_to_go = GoalToGo) %>%
    return
}

updated_pbp_db_data <-add_ep_variables_adj(pbp_db_data_final)




