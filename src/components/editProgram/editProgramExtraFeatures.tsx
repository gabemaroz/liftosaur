import { h, JSX, Fragment } from "preact";
import { useState } from "preact/hooks";
import { IProgramExercise, ISettings } from "../../types";
import { GroupHeader } from "../groupHeader";
import { MenuItemWrapper } from "../menuItem";
import { MenuItemEditable } from "../menuItemEditable";
import { EditProgramExerciseTimer } from "./editProgramExerciseTimer";

interface IProps {
  onChangeTimer: (value: string) => void;
  onChangeQuickAddSets: (value: boolean) => void;
  onValid: (isValid: boolean) => void;
  areVariationsEnabled: boolean;
  onEnableVariations: (value: boolean) => void;
  day: number;
  settings: ISettings;
  programExercise: IProgramExercise;
}

export function EditProgramExtraFeatures(props: IProps): JSX.Element {
  const { programExercise } = props;
  const [showTimer, setShowTimer] = useState(!!programExercise.timerExpr);

  return (
    <div>
      <GroupHeader
        topPadding={true}
        name="Extra features"
        help={
          <>
            <div>
              <strong>Timer: </strong> Liftoscript expression for the exercise's timer. If empty, will use default
              global timer from Settings.
            </div>
            <div>
              <strong>Set Variations: </strong> Enable if you want different number of set schemes based on a condition.
            </div>
          </>
        }
      />
      {props.areVariationsEnabled ? (
        <MenuItemWrapper name="set-variations-are-enabled">
          <div className="py-2">Set Variations are enabled</div>
        </MenuItemWrapper>
      ) : (
        <MenuItemEditable
          type="boolean"
          name="Enable Set Variations"
          value={props.areVariationsEnabled ? "true" : "false"}
          onChange={(v) => {
            props.onEnableVariations(v === "true");
          }}
        />
      )}
      <MenuItemEditable
        type="boolean"
        name="Enable Exercise Rest Timer"
        value={showTimer ? "true" : "false"}
        onChange={(v) => {
          setShowTimer(v === "true");
          if (v !== "true") {
            props.onChangeTimer("");
          }
        }}
        nextLine={
          showTimer ? (
            <div className="pl-4">
              <EditProgramExerciseTimer
                day={props.day}
                settings={props.settings}
                state={programExercise.state}
                equipment={programExercise.exerciseType.equipment}
                timerExpr={programExercise.timerExpr}
                onValid={props.onValid}
                onChangeTimer={props.onChangeTimer}
              />
            </div>
          ) : undefined
        }
      />
      <MenuItemEditable
        type="boolean"
        name="Enable Quick Add Sets"
        value={programExercise.quickAddSets ? "true" : "false"}
        onChange={(v) => {
          props.onChangeQuickAddSets(v === "true");
        }}
      />
    </div>
  );
}