import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.nio.charset.StandardCharsets;

// Standalone local library probe: no account, token, hash or input value is printed.
public class PasswordEncoderProbe {
  public static void main(String[] args) {
    var encoder = new BCryptPasswordEncoder();
    String[] labels = {"ASCII_72", "ASCII_73", "ASCII_100", "KHMER_26_UNITS_74_BYTES"};
    String[] inputs = {"A1"+"x".repeat(70), "A1"+"x".repeat(71), "A1"+"x".repeat(98), "A1"+"ក".repeat(24)};
    for (int i=0;i<inputs.length;i++) {
      String outcome;
      try { String hash=encoder.encode(inputs[i]); outcome="ENCODED;MATCH="+encoder.matches(inputs[i],hash); }
      catch(Exception error) { outcome=error.getClass().getSimpleName()+":"+error.getMessage(); }
      System.out.println(labels[i]+"|units="+inputs[i].length()+"|bytes="+inputs[i].getBytes(StandardCharsets.UTF_8).length+"|"+outcome);
    }
  }
}
