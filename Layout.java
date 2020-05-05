import java.awt.*;
import java.awt.event.*;
import javax.swing.*;
import java.util.Random;


public class Layout extends JFrame
{
  public static int width, height = 700;
  JPanel panel1 = new JPanel();
  private JLabel messageLabel;
  private JTextField answerField;
  private JButton Search;

  public Layout()
  {
    Search = new JButton("View Results");
    setTitle("FootBall PlayCalling System");
    setSize(700,700);
    setVisible(true);
    setDefaultCloseOperation(EXIT_ON_CLOSE);
    panel1.setLayout(new FlowLayout());
    answerField = new JTextField(6);
    panel1.add(Search);
    panel1.add(answerField);
    add(panel1);

  }
  public void paint(Graphics g)
  {
    //the rectangle x,y, width and height
    g.setColor(Color.BLUE);
    g.fillRect(10,80,330,550);
    g.setColor(Color.BLUE);
    g.drawRect(350,80,330,550);
    //answerField = new JTextField(6);

    //panel1.add(g);
    //panel1.add(answerField);
    //g.add(answerField);


  }

  public static void main(String [] args)
  {
    Layout l = new Layout();
    l.paint(null);
  }
}
