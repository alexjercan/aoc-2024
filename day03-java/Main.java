import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.stream.Collectors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Main
{
    private static String getInput() {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        return reader.lines().collect(Collectors.joining(""));
    }

    private static String part1(String input) {
        Pattern pattern = Pattern.compile("mul\\((\\d{1,3}),(\\d{1,3})\\)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(input);

        int sum = 0;
        while (matcher.find()) {
            var lhs = Integer.parseInt(matcher.group(1));
            var rhs = Integer.parseInt(matcher.group(2));

            sum = sum + (lhs * rhs);
        }

        return String.valueOf(sum);
    }

    private static String part2(String input) {
        Pattern pattern = Pattern.compile("do\\(\\)|don't\\(\\)|mul\\((\\d{1,3}),(\\d{1,3})\\)");
        Matcher matcher = pattern.matcher(input);

        int sum = 0;
        boolean enabled = true;
        while (matcher.find()) {
            var command = matcher.group().strip();

            if (command.equals("don't()")) {
                enabled = false;
            } else if (command.equals("do()")) {
                enabled = true;
            } else if (enabled) {
                var lhs = Integer.parseInt(matcher.group(1));
                var rhs = Integer.parseInt(matcher.group(2));

                sum = sum + (lhs * rhs);
            }
        }

        return String.valueOf(sum);
    }

    public static void main(String []args)
    {
        var input = getInput();

        System.out.println("Part1: " + part1(input));
        System.out.println("Part2: " + part2(input));
    }
};
