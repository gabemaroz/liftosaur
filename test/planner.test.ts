import "mocha";
import { expect } from "chai";
import { PlannerProgram } from "../src/pages/planner/models/plannerProgram";
import { PlannerTestUtils } from "./utils/plannerTestUtils";
import { IPlannerProgram } from "../src/types";
import { Settings } from "../src/models/settings";
import { PlannerSyntaxError } from "../src/pages/planner/plannerExerciseEvaluator";

describe("Planner", () => {
  it("updates weight and lp progress after completing", () => {
    const programText = `# Week 1
## Day 1
Squat / 2x5 / 100lb / progress: lp(5lb)`;
    const { program } = PlannerTestUtils.finish(programText, { completedReps: [[5, 5]] });
    const newText = PlannerProgram.generateFullText(program.planner!.weeks);
    expect(newText).to.equal(`# Week 1
## Day 1
Squat / 2x5 / 105lb / progress: lp(5lb, 1, 0, 10lb, 0, 0)


`);
  });

  it("compacts repeated exercises", () => {
    const programText = `# Week 1
## Day 1
Squat / 2x5

# Week 2
## Day 1
Squat / 2x5

# Week 3
## Day 1
Squat / 2x5
`;
    const { program } = PlannerTestUtils.finish(programText, { completedReps: [[5, 5]] });
    const newText = PlannerProgram.generateFullText(program.planner!.weeks);
    expect(newText).to.equal(`# Week 1
## Day 1
Squat[1-3] / 2x5 / 86.53%


# Week 2
## Day 1



# Week 3
## Day 1



`);
  });

  it("splits and compacts after mid-program progression", () => {
    const programText = `# Week 1
## Day 1
Squat[1-5] / 2x5 / progress: custom() {~
  weights[3:*:*:*] += 10lb
~}
Bench Press[1-5] / 2x5

# Week 2
## Day 1

# Week 3
## Day 1

# Week 4
## Day 1

# Week 5
## Day 1
`;
    const { program } = PlannerTestUtils.finish(programText, {
      completedReps: [
        [5, 5],
        [5, 5],
      ],
    });
    const newText = PlannerProgram.generateFullText(program.planner!.weeks);
    expect(newText).to.equal(`# Week 1
## Day 1
Squat / 2x5 / 86.53% / progress: custom() {~
  weights[3:*:*:*] += 10lb
~}
Bench Press[1-5] / 2x5 / 86.53%


# Week 2
## Day 1
Squat / 2x5 / 86.53%


# Week 3
## Day 1
Squat / 2x5 / 126.8lb


# Week 4
## Day 1
Squat[4-5] / 2x5 / 86.53%


# Week 5
## Day 1



`);
  });

  it("use templates", () => {
    const programText = `# Week 1
## Day 1
tmp: Squat[1-5] / 2x5 / used: none / progress: custom() {~
  weights[3:*:*:*] += 10lb
~}
Squat[1-5] / ...tmp: Squat / progress: custom() { ...tmp: Squat }
Bench Press[1-5] / ...tmp: Squat / progress: custom() { ...tmp: Squat }

# Week 2
## Day 1

# Week 3
## Day 1

# Week 4
## Day 1

# Week 5
## Day 1
`;
    const { program } = PlannerTestUtils.finish(programText, {
      completedReps: [
        [5, 5],
        [5, 5],
      ],
    });
    const newText = PlannerProgram.generateFullText(program.planner!.weeks);
    expect(newText).to.equal(`# Week 1
## Day 1
tmp: Squat / used: none / 2x5 / 86.53% / progress: custom() {~
  weights[3:*:*:*] += 10lb
~}
Squat / ...tmp: Squat / progress: custom() { ...tmp: Squat }
Bench Press / ...tmp: Squat / progress: custom() { ...tmp: Squat }


# Week 2
## Day 1
tmp: Squat[2-5] / used: none / 2x5 / 86.53%
Squat / ...tmp: Squat
Bench Press / ...tmp: Squat


# Week 3
## Day 1
Squat / 2x5 / 126.8lb
Bench Press / 2x5 / 126.8lb


# Week 4
## Day 1
Squat[4-5] / ...tmp: Squat
Bench Press[4-5] / ...tmp: Squat


# Week 5
## Day 1



`);
  });

  it("show an error for reuse/repeat mismatch", () => {
    const programText = `# Week 1
## Day 1
tmp: Squat[1-2] / 2x5 / used: none / progress: custom() {~
  weights[3:*:*:*] += 10lb
~}
Squat[1-5] / ...tmp: Squat / progress: custom() { ...tmp: Squat }
Bench Press[1-5] / ...tmp: Squat / progress: custom() { ...tmp: Squat }

# Week 2
## Day 1

# Week 3
## Day 1

# Week 4
## Day 1

# Week 5
## Day 1
`;
    const planner: IPlannerProgram = { name: "MyProgram", weeks: PlannerProgram.evaluateText(programText) };
    const evaluatedWeeks = PlannerProgram.evaluate(planner, Settings.build()).evaluatedWeeks;
    expect(evaluatedWeeks[2][0]).to.deep.equal({
      success: false,
      error: new PlannerSyntaxError("Reused and repeated exercises mismatch for 'Squat'", 0, 0, 0, 0),
    });
  });
});