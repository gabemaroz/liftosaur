import { IDI } from "./di";
import * as t from "io-ts";
import { ChatCompletionRequestMessage, ChatCompletionResponseMessage, Configuration, OpenAIApi } from "openai";
import { IProgramExercise, equipments, TUnit, IProgram } from "../../src/types";
import { PathReporter } from "io-ts/lib/PathReporter";
import { IArrayElement, IEither } from "../../src/utils/types";
import { UidFactory } from "../../src/utils/generator";
import { CollectionUtils } from "../../src/utils/collection";
import { Exercise, exercises } from "../../src/models/exercise";

function generateRequestMessage(prompt: string): ChatCompletionRequestMessage[] {
  return [
    {
      role: "system",
      content: `
      Given the TypeScript types:

      type IExerciseId = 'abWheel' | 'arnoldPress' | 'aroundTheWorld' | 'backExtension' | 'ballSlams' | 'battleRopes' | 'benchDip' | 'benchPress' | 'benchPressCloseGrip' | 'benchPressWideGrip' | 'bentOverOneArmRow' | 'bentOverRow' | 'bicepCurl' | 'bicycleCrunch' | 'boxJump' | 'boxSquat' | 'bulgarianSplitSquat' | 'burpee' | 'cableCrossover' | 'cableCrunch' | 'cableKickback' | 'cablePullThrough' | 'cableTwist' | 'calfPressOnLegPress' | 'calfPressOnSeatedLegPress' | 'chestDip' | 'chestFly' | 'chestPress' | 'chinUp' | 'clean' | 'cleanandJerk' | 'concentrationCurl' | 'crossBodyCrunch' | 'crunch' | 'cycling' | 'deadlift' | 'deadliftHighPull' | 'declineBenchPress' | 'declineCrunch' | 'deficitDeadlift' | 'ellipticalMachine' | 'facePull' | 'flatKneeRaise' | 'flatLegRaise' | 'frontRaise' | 'frontSquat' | 'gobletSquat' | 'goodMorning' | 'gluteBridge' | 'gluteBridgeMarch' | 'hackSquat' | 'hammerCurl' | 'handstandPushUp' | 'hangClean' | 'hangSnatch' | 'hangingLegRaise' | 'highKneeSkips' | 'hipAbductor' | 'hipThrust' | 'inclineBenchPress' | 'inclineChestFly' | 'inclineChestPress' | 'inclineCurl' | 'inclineRow' | 'invertedRow' | 'isoLateralChestPress' | 'isoLateralRow' | 'jackknifeSitUp' | 'jumpRope' | 'jumpSquat' | 'jumpingJack' | 'kettlebellSwing' | 'kettlebellTurkishGetUp' | 'kippingPullUp' | 'kneeRaise' | 'kneelingPulldown' | 'kneestoElbows' | 'latPulldown' | 'lateralBoxJump' | 'lateralRaise' | 'legExtension' | 'legPress' | 'lunge' | 'lyingLegCurl' | 'mountainClimber' | 'muscleUp' | 'obliqueCrunch' | 'overheadPress' | 'overheadSquat' | 'pecDeck' | 'pendlayRow' | 'pistolSquat' | 'plank' | 'powerClean' | 'powerSnatch' | 'preacherCurl' | 'pressUnder' | 'pullUp' | 'pullover' | 'pushPress' | 'pushUp' | 'reverseCrunch' | 'reverseCurl' | 'reverseFly' | 'reverseGripConcentrationCurl' | 'reversePlank' | 'romanianDeadlift' | 'reverseHyperextension' | 'rowing' | 'russianTwist' | 'seatedCalfRaise' | 'seatedLegCurl' | 'seatedLegPress' | 'seatedOverheadPress' | 'seatedPalmsUpWristCurl' | 'seatedRow' | 'seatedWideGripRow' | 'shoulderPress' | 'shrug' | 'sideBend' | 'sideCrunch' | 'sideHipAbductor' | 'sideLyingClam' | 'sidePlank' | 'singleLegBridge' | 'singleLegDeadlift' | 'singleLegGluteBridgeBench' | 'singleLegGluteBridgeStraight' | 'singleLegGluteBridgeBentKnee' | 'singleLegHipThrust' | 'sitUp' | 'skullcrusher' | 'snatch' | 'snatchPull' | 'splitJerk' | 'squat' | 'squatRow' | 'standingCalfRaise' | 'stepUp' | 'stiffLegDeadlift' | 'straightLegDeadlift' | 'sumoDeadlift' | 'sumoDeadliftHighPull' | 'superman' | 'tBarRow' | 'thruster' | 'toesToBar' | 'torsoRotation' | 'trapBarDeadlift' | 'tricepsDip' | 'tricepsExtension' | 'tricepsPushdown' | 'uprightRow' | 'vUp' | 'widePullUp' | 'wristRoller' | 'zercherSquat';
      type IExerciseEquipment = 'barbell' | 'cable' | 'dumbbell' | 'smith' | 'band' | 'kettlebell' | 'bodyweight' | 'leverageMachine' | 'medicineball' | 'ezbar' | 'trapbar';

      type IExerciseType = {
        exerciseId: IExerciseId;
        equipment: IExerciseEquipment;
      }

      interface ISet {
        reps: number;
        weight: number;
        isAmrap: boolean;
      }

      interface IExercise {
        name: string;
        exerciseType: IExerciseType;
        sets: ISet[];
      }

      interface IWorkout {
        name: string;
        exercises: IExercise[];
      }

      interface IProgram {
        settings: {
          unit: "kg" | "lb";
        };
        name: string;
        workouts: IWorkout[];
      }

      Translate the user input to JSON, that would be valid for the IProgram type.
      Don't add any explanations, details, or any other text, output only JSON!
      Come up with some reasonable weights if they're missing, e.g. Squat - 225lb or 100kg, etc
      `,
      //       content: `
      // There's a new language for weightlifting programs - Liftoscript. It's similar to JavaScript, but only has if/else syntax. It has no loops, no functions.
      // It works this way - each exercise may define "state variables" - it's a variable that can be changed after finishing an exercise.
      // It could be current weight, current reps, number of attempts, etc. Liftoscript may use these variables, and may change them in "Finish Day Script".

      // For each set, you define weight and reps as Liftoscript expression. The value it returns will be used for reps/weight.
      // There're no variables in Liftoscript, but you can use state variables, via 'state.variableName' syntax. You can assign values to them like
      // 'state.variableName = 5', or change them like 'state.variableName = state.variableName + 5'. State variables may have the following
      // types: number, lb, kg.

      // Language has the following types:: number, lb, kg. It has the following operators:
      // * Math: +, -, /, *
      // * Boolean: >, <, <=, >=, ==, &&, ||
      // * Ternary operator

      // There're predefined constants, that are not state variables, but can be used in Liftoscript:
      // * weights - array of weights for each set, index starts from 1.
      // * reps - array of number of reps required for each set, index starts from 1.
      // * completedReps - array of completed number of reps for each set, index starts from 1.
      // * day - current day number, starting from 1.
      // Those arrays don't have 'length' property, but you can use weights[n] to access them by index.

      // There's a special syntax to compare all completed reps with required reps for exercise.
      // You can write 'if (completedReps >= reps)', and it will compare each completed rep with required rep, and if all of them
      // are more or equal, then completedReps >= reps will be true.

      // So, there're 3 places for Liftoscript:
      // * Reps expression - it should return the number of required reps for the current set. We don't update state variables here, but we can read them.
      //   Examples: 'state.reps', 'state.reps + 1', 'state.reps - 3'
      // * Weight expression - it should return the weight for the current set. We don't update state variables here, but we can read them.
      //   Examples: 'state.weight', 'state.weight * 0.8', 'state.onerm * 0.8'
      // * Finish Day Script - it will update the state variables for the next workout. It doesn't return anything.
      //   If you don't want to update state variables for the next workout, leave it empty.
      //   Example: 'if (completedReps >= reps) { state.weight = state.weight + 2.5lb; }'

      // Examples of reps exression:
      // * 'state.reps' - return the state variable 'reps' value
      // * 'state.reps + 1' - return the state variable 'reps' value + 1
      // * 'state.reps * 2' - return the state variable 'reps' value * 2
      // Counter examples - invalid reps exressions:
      // * '4+' - don't use this, this is invalid syntax
      // * '5+' - don't use this, this is invalid syntax

      // Examples of weight expression:
      // * 'state.tm * 0.8' - return the 80% of training max (given there 'tm' state variable)
      // * 'state.weight' - just returns the state variable 'weight' value
      // * 'state.onerm * 0.6' - returns the 60% of one rep max (given there's 'onerm' state variable)

      // Examples of Liftoscript finish day scripts:

      // 1. If you completed all reps, increase weight by 2.5lb

      //     if (completedReps >= reps) {
      //       state.weight = state.weight + 2.5lb;
      //     }

      // 2. If you completed all reps, increase weight by 2.5lb, but if you didn't complete all reps, decrease weight by 10%

      //     if (completedReps >= reps) {
      //       state.weight = state.weight + 2.5lb;
      //     } else {
      //       state.weight = state.weight * 0.9;
      //     }

      // 3. Reps ladder-up - we increase reps from 8 to 12, then increase weight and reset reps to 6.

      //     if (completedReps >= reps) {
      //       state.reps = state.reps + 1
      //     }
      //     if (state.reps > 12) {
      //       state.reps = 8
      //       state.weight = state.weight + 5lb
      //     }

      // 4. At least one more rep
      // Similar to Linear Progression, but we only consider it failure if you lifted
      // less than last time. I.e if you need to lift 2x12, and you lifted 12 and 6 reps,
      // but last time you lifted 12 and 4 reps, we don't consider it a failure. We'll
      // increase weight only when you lift 2x12 though.

      //     if (completedReps >= reps) {
      //       state.weight = state.weight + 5lb
      //       state.failures = 0
      //       state.lastReps = 0
      //     } else {
      //       if (completedReps[1] + completedReps[2] <= state.lastReps) {
      //         state.failures = state.failures + 1
      //       } else {
      //         state.lastReps = completedReps[1] + completedReps[2]
      //       }
      //       if (state.failures >= 3) {
      //         state.weight = state.weight - 5lb
      //         state.lastReps = 0
      //         state.failures = 0
      //       }
      //     }

      // Given the TypeScript types:

      // interface IProgramSet {
      //   repsLiftoscriptExpression: string; // Liftoscript expression that returns number of required reps for the current workout
      //   weightLiftoscriptExpression: string; // Liftoscript expression that returns weight for the current workout
      //   isAmrap?: boolean; // Whether this set is AMRAP
      // }

      // interface IWeight {
      //   value: number,
      //   unit: "lb" | "kg",
      // }

      // type IStateVariables = { [key: string]: number | IWeight }; // Contains all state variables for the current exercise

      // type IExerciseType = {
      //   exerciseName: 'abWheel' | 'arnoldPress' | 'aroundTheWorld' | 'backExtension' | 'ballSlams' | 'battleRopes' | 'benchDip' | 'benchPress' | 'benchPressCloseGrip' | 'benchPressWideGrip' | 'bentOverOneArmRow' | 'bentOverRow' | 'bicepCurl' | 'bicycleCrunch' | 'boxJump' | 'boxSquat' | 'bulgarianSplitSquat' | 'burpee' | 'cableCrossover' | 'cableCrunch' | 'cableKickback' | 'cablePullThrough' | 'cableTwist' | 'calfPressOnLegPress' | 'calfPressOnSeatedLegPress' | 'chestDip' | 'chestFly' | 'chestPress' | 'chinUp' | 'clean' | 'cleanandJerk' | 'concentrationCurl' | 'crossBodyCrunch' | 'crunch' | 'cycling' | 'deadlift' | 'deadliftHighPull' | 'declineBenchPress' | 'declineCrunch' | 'deficitDeadlift' | 'ellipticalMachine' | 'facePull' | 'flatKneeRaise' | 'flatLegRaise' | 'frontRaise' | 'frontSquat' | 'gobletSquat' | 'goodMorning' | 'gluteBridge' | 'gluteBridgeMarch' | 'hackSquat' | 'hammerCurl' | 'handstandPushUp' | 'hangClean' | 'hangSnatch' | 'hangingLegRaise' | 'highKneeSkips' | 'hipAbductor' | 'hipThrust' | 'inclineBenchPress' | 'inclineChestFly' | 'inclineChestPress' | 'inclineCurl' | 'inclineRow' | 'invertedRow' | 'isoLateralChestPress' | 'isoLateralRow' | 'jackknifeSitUp' | 'jumpRope' | 'jumpSquat' | 'jumpingJack' | 'kettlebellSwing' | 'kettlebellTurkishGetUp' | 'kippingPullUp' | 'kneeRaise' | 'kneelingPulldown' | 'kneestoElbows' | 'latPulldown' | 'lateralBoxJump' | 'lateralRaise' | 'legExtension' | 'legPress' | 'lunge' | 'lyingLegCurl' | 'mountainClimber' | 'muscleUp' | 'obliqueCrunch' | 'overheadPress' | 'overheadSquat' | 'pecDeck' | 'pendlayRow' | 'pistolSquat' | 'plank' | 'powerClean' | 'powerSnatch' | 'preacherCurl' | 'pressUnder' | 'pullUp' | 'pullover' | 'pushPress' | 'pushUp' | 'reverseCrunch' | 'reverseCurl' | 'reverseFly' | 'reverseGripConcentrationCurl' | 'reversePlank' | 'romanianDeadlift' | 'reverseHyperextension' | 'rowing' | 'russianTwist' | 'seatedCalfRaise' | 'seatedLegCurl' | 'seatedLegPress' | 'seatedOverheadPress' | 'seatedPalmsUpWristCurl' | 'seatedRow' | 'seatedWideGripRow' | 'shoulderPress' | 'shrug' | 'sideBend' | 'sideCrunch' | 'sideHipAbductor' | 'sideLyingClam' | 'sidePlank' | 'singleLegBridge' | 'singleLegDeadlift' | 'singleLegGluteBridgeBench' | 'singleLegGluteBridgeStraight' | 'singleLegGluteBridgeBentKnee' | 'singleLegHipThrust' | 'sitUp' | 'skullcrusher' | 'snatch' | 'snatchPull' | 'splitJerk' | 'squat' | 'squatRow' | 'standingCalfRaise' | 'stepUp' | 'stiffLegDeadlift' | 'straightLegDeadlift' | 'sumoDeadlift' | 'sumoDeadliftHighPull' | 'superman' | 'tBarRow' | 'thruster' | 'toesToBar' | 'torsoRotation' | 'trapBarDeadlift' | 'tricepsDip' | 'tricepsExtension' | 'tricepsPushdown' | 'uprightRow' | 'vUp' | 'widePullUp' | 'wristRoller' | 'zercherSquat';
      //   equipment: 'barbell' | 'cable' | 'dumbbell' | 'smith' | 'band' | 'kettlebell' | 'bodyweight' | 'leverageMachine' | 'medicineball' | 'ezbar' | 'trapbar';
      // }

      // interface IProgramExercise {
      //   exercise: IExerciseType;
      //   sets: IProgramSet[]; // Array of sets for the current exercise, order is important
      //   stateVariables: IStateVariables;
      //   finishDayLiftoscriptScript?: string; // Finish Day Script - optional Liftoscript script that will update state variables for the next workout if user specified
      // }

      // interface IWorkout {
      //   name: string;
      //   exercises: IProgramExercise[];
      // }

      // interface IProgram {
      //   name: string;
      //   workouts: IWorkout[];
      // }

      // Each set would be an object in IProgramExercise.sets array.

      // Translate user input to a JSON that would be valid for the IProgram type. Don't respond with any explanations, or any other text, output only JSON!!!
      // The output must be a valid JSON, so you can use JSON.stringify() to convert it to string.
      // Try to use state variables in Liftoscript expressions, and use 'finishDayLiftoscriptScript' to update them.
      // Do not set 'IProgramExercise.finishDayLiftoscriptScript' field if user didn't specify the state variables change logic!!!
      // All Liftoscript scripts must be valid JavaScript syntax (except the kg and lb type suffixes)
      // All state variables should be defined in 'stateVariables' object.
      // '5+' is invalid Liftoscript syntax, and must not be used.
      // Reps with + in means it's AMRAP set.
      // The order of sets in user's input is important, keep it.
      //     `,
    },
    {
      role: "user",
      content: prompt,
    },
  ];
}

const exercisesList = Object.keys(exercises);
export const TFreeformExerciseId = t.keyof(
  exercisesList.reduce<Record<IArrayElement<typeof exercisesList>, null>>((memo, barKey) => {
    memo[barKey] = null;
    return memo;
  }, {} as Record<IArrayElement<typeof exercisesList>, null>),
  "IExerciseId"
);
export type IFreeformExerciseId = t.TypeOf<typeof TFreeformExerciseId>;

export const TFreeformEquipment = t.keyof(
  equipments.reduce<Record<IArrayElement<typeof equipments>, null>>((memo, barKey) => {
    memo[barKey] = null;
    return memo;
  }, {} as Record<IArrayElement<typeof equipments>, null>),
  "IExerciseEquipment"
);
export type IFreeformEquipment = t.TypeOf<typeof TFreeformEquipment>;

export const TFreeformExerciseType = t.type(
  {
    exerciseId: TFreeformExerciseId,
    equipment: TFreeformEquipment,
  },
  "IExerciseType"
);
export type IFreeformExerciseType = t.TypeOf<typeof TFreeformExerciseType>;

const TFreeformSet = t.type(
  {
    reps: t.number,
    weight: t.number,
    isAmrap: t.boolean,
  },
  "ISet"
);
export type IFreeformSet = t.TypeOf<typeof TFreeformSet>;

const TFreeformExercise = t.type(
  {
    name: t.string,
    exerciseType: TFreeformExerciseType,
    sets: t.array(TFreeformSet),
  },
  "IExercise"
);
export type IFreeformExercise = t.TypeOf<typeof TFreeformExercise>;

const TFreeformWorkout = t.type(
  {
    name: t.string,
    exercises: t.array(TFreeformExercise),
  },
  "IWorkout"
);
export type IFreeformWorkout = t.TypeOf<typeof TFreeformWorkout>;

const TFreeformProgram = t.type(
  {
    settings: t.type({
      unit: TUnit,
    }),
    name: t.string,
    workouts: t.array(TFreeformWorkout),
  },
  "IProgram"
);
export type IFreeformProgram = t.TypeOf<typeof TFreeformProgram>;

class InvalidJsonError extends Error {}
class InvalidSchemaError extends Error {
  constructor(public readonly error: string[]) {
    super();
  }
}

export class FreeformGenerator {
  constructor(private readonly di: IDI) {}

  public async generate(
    prompt: string
  ): Promise<IEither<{ program: IProgram; response: string }, { error: string[]; response: string }>> {
    const requestMessage = generateRequestMessage(prompt);
    let attempt = 0;
    let message: ChatCompletionResponseMessage | undefined;
    let result: IEither<IFreeformProgram, string[]> | undefined;
    do {
      message = await this.makeCall(requestMessage);
      console.log("A");
      if (message) {
        console.log("B");
        try {
          let json;
          try {
            json = JSON.parse(message.content);
          } catch (e) {
            try {
              const splitted = message.content.split("```");
              const rawJson = splitted[1].replace(/^[^\{]*/, "").trim();
              json = JSON.parse(rawJson);
            } catch (e2) {
              throw new InvalidJsonError();
            }
          }

          if (json) {
            const decoded = TFreeformProgram.decode(json);
            if ("left" in decoded) {
              const error = PathReporter.report(decoded);
              throw new InvalidSchemaError(error);
            } else {
              const value = decoded.right;
              result = { success: true, data: value };
            }
          } else {
            throw new InvalidJsonError();
          }
        } catch (e) {
          if (e instanceof InvalidJsonError) {
            requestMessage.push(message);
            requestMessage.push({
              role: "user",
              content:
                "Your response is not valid JSON. Please only return JSON that would be valid for the IProgram type",
            });
            attempt += 1;
          } else if (e instanceof InvalidSchemaError) {
            requestMessage.push(message);
            requestMessage.push({
              role: "user",
              content: `Your response is not valid IProgram schema. Please only return JSON that would be valid for the IProgram type. Error: ${e.error}`,
            });
            attempt += 1;
          }
        }
      }
    } while (result == null && attempt < 3);
    if (result == null) {
      result = { success: false, error: ["Could not generate program"] };
    }
    if (message) {
      requestMessage.push(message);
    }

    const response = requestMessage
      .slice(1)
      .map((m) => m.content)
      .join("\n\n");
    if (result.success) {
      const program = this.freeformProgramToProgram(result.data);
      console.log("Program", program);
      console.log("Response", response);
      return { success: true, data: { program, response } };
    } else {
      console.log("Error Response", response);
      return { success: false, error: { error: ["Could not generate program"], response } };
    }
  }

  private async makeCall(
    requestMessage: ChatCompletionRequestMessage[]
  ): Promise<ChatCompletionResponseMessage | undefined> {
    const apiKey = await this.di.secrets.getOpenAiKey();
    const configuration = new Configuration({ apiKey });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: requestMessage,
      temperature: 0,
    });
    return response.data.choices[0]?.message;
  }

  private freeformProgramToProgram(freeformProgram: IFreeformProgram): IProgram {
    const programExercises: IProgramExercise[] = freeformProgram.workouts.flatMap((workout) =>
      workout.exercises.map<IProgramExercise>((exercise) => {
        const maxRep = Math.max(...exercise.sets.map((set) => set.reps));
        const maxWeight = Math.max(...exercise.sets.map((set) => set.weight));

        return {
          exerciseType: {
            id: exercise.exerciseType.exerciseId,
            equipment: exercise.exerciseType.equipment,
          },
          id: UidFactory.generateUid(8),
          name: exercise.name,
          variationExpr: "1",
          variations: [
            {
              sets: exercise.sets.map((set) => {
                const diffRep = maxRep - set.reps;
                const diffWeight = maxWeight - set.weight;
                return {
                  repsExpr: diffRep === 0 ? "state.reps" : `state.reps - ${diffRep}`,
                  weightExpr: diffWeight === 0 ? "state.weight" : `state.weight - ${diffWeight}`,
                  isAmrap: set.isAmrap,
                };
              }),
            },
          ],
          finishDayExpr: "",
          state: {
            reps: maxRep,
            weight: {
              value: maxWeight,
              unit: freeformProgram.settings.unit,
            },
          },
        };
      })
    );
    const exercisesByType = programExercises.reduce<Partial<Record<string, IProgramExercise>>>((memo, ex) => {
      memo[Exercise.toKey(ex.exerciseType)] = ex;
      return memo;
    }, {});

    return {
      name: freeformProgram.name,
      exercises: programExercises,
      author: "ChatGPT",
      description: "Generated by ChatGPT",
      nextDay: 0,
      url: "",
      id: UidFactory.generateUid(8),
      tags: [],
      days: freeformProgram.workouts.map((workout) => ({
        name: workout.name,
        exercises: CollectionUtils.compact(
          workout.exercises.map((exercise) => {
            const ex =
              exercisesByType[
                Exercise.toKey({ id: exercise.exerciseType.exerciseId, equipment: exercise.exerciseType.equipment })
              ];
            return ex ? { id: ex.id } : undefined;
          })
        ),
      })),
    };
  }
}