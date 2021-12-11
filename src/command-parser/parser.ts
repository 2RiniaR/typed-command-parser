import { interpretCommand, InterpretFormat, InterpretResult } from "./interpreter";
import { convertParameter, ConvertType } from "./converter";
import {
  CommandFormatArguments,
  CommandFormatArgumentsCount,
  CommandFormatOptions,
  ConvertPatternSet
} from "./base-types";

export type ConvertTypeSet<TConvertPatternSet extends ConvertPatternSet> = {
  [key in keyof TConvertPatternSet]: ConvertType<TConvertPatternSet[key]>;
};

export type CommandFormatDefault<TConvertPatternSet extends ConvertPatternSet> = CommandFormat<
  TConvertPatternSet,
  CommandFormatArgumentsCount,
  CommandFormatArguments<ConvertPatternSet, CommandFormatArgumentsCount>,
  CommandFormatOptions<ConvertPatternSet>
>;

export type CommandFormat<
  TConvertPatternSet extends ConvertPatternSet,
  TArgumentsCount extends CommandFormatArgumentsCount,
  TArguments extends CommandFormatArguments<TConvertPatternSet, TArgumentsCount>,
  TOptions extends CommandFormatOptions<TConvertPatternSet>
> = {
  readonly prefixes: readonly string[];
  readonly arguments: TArguments;
  readonly options: TOptions;
};

export type CommandResult<
  TConvertPatternSet extends ConvertPatternSet,
  TArgumentsCount extends CommandFormatArgumentsCount,
  TArguments extends CommandFormatArguments<TConvertPatternSet, TArgumentsCount>,
  TOptions extends CommandFormatOptions<TConvertPatternSet>
> = {
  readonly prefix: string;
  readonly arguments: CommandResultArguments<TConvertPatternSet, TArgumentsCount, TArguments>;
  readonly options: CommandResultOptions<TConvertPatternSet, TOptions>;
};

type Parameter<TConvertPatternSet extends ConvertPatternSet = ConvertPatternSet> = {
  readonly name: string;
  readonly description: string;
  readonly type: keyof TConvertPatternSet;
};

type CommandResultArguments<
  TConvertPatternSet extends ConvertPatternSet,
  TArgumentsCount extends CommandFormatArgumentsCount,
  TArguments extends CommandFormatArguments<TConvertPatternSet, TArgumentsCount>
> = TArguments[0] extends Parameter<TConvertPatternSet>
  ? TArguments[1] extends Parameter<TConvertPatternSet>
    ? TArguments[2] extends Parameter<TConvertPatternSet>
      ? TArguments[3] extends Parameter<TConvertPatternSet>
        ? TArguments[4] extends Parameter<TConvertPatternSet>
          ? [
              TConvertPatternSet[TArguments[0]["type"]],
              TConvertPatternSet[TArguments[1]["type"]],
              TConvertPatternSet[TArguments[2]["type"]],
              TConvertPatternSet[TArguments[3]["type"]],
              TConvertPatternSet[TArguments[4]["type"]]
            ]
          : [
              TConvertPatternSet[TArguments[0]["type"]],
              TConvertPatternSet[TArguments[1]["type"]],
              TConvertPatternSet[TArguments[2]["type"]],
              TConvertPatternSet[TArguments[3]["type"]]
            ]
        : [
            TConvertPatternSet[TArguments[0]["type"]],
            TConvertPatternSet[TArguments[1]["type"]],
            TConvertPatternSet[TArguments[2]["type"]]
          ]
      : [TConvertPatternSet[TArguments[0]["type"]], TConvertPatternSet[TArguments[1]["type"]]]
    : [TConvertPatternSet[TArguments[0]["type"]]]
  : [];

type CommandResultOptions<
  TConvertPatternSet extends ConvertPatternSet,
  TOptions extends CommandFormatOptions<TConvertPatternSet>
> = {
  [key in keyof TOptions]?: TConvertPatternSet[TOptions[key]["type"]];
};

function convertArguments<
  TConvertPatternSet extends ConvertPatternSet,
  TArgumentsCount extends CommandFormatArgumentsCount,
  TArguments extends CommandFormatArguments<TConvertPatternSet, TArgumentsCount>,
  TOptions extends CommandFormatOptions<TConvertPatternSet>
>(
  values: InterpretResult<TConvertPatternSet, TArgumentsCount, TOptions>,
  format: CommandFormat<TConvertPatternSet, TArgumentsCount, TArguments, TOptions>,
  types: ConvertTypeSet<TConvertPatternSet>
): CommandResultArguments<TConvertPatternSet, TArgumentsCount, TArguments> {
  const parameters = values.arguments.map((argument, index) => {
    const fmt = format.arguments[index];
    if (!fmt) throw Error();
    const param = {
      name: `${(index + 1).toString()} 番目の引数`,
      description: fmt.description,
      value: values.arguments[index],
      convertType: types[fmt.type]
    };
    return convertParameter(param);
  });
  return parameters as CommandResultArguments<TConvertPatternSet, TArgumentsCount, TArguments>;
}

function convertOptions<
  TConvertPatternSet extends ConvertPatternSet,
  TArgumentsCount extends CommandFormatArgumentsCount,
  TArguments extends CommandFormatArguments<TConvertPatternSet, TArgumentsCount>,
  TOptions extends CommandFormatOptions<TConvertPatternSet>
>(
  values: InterpretResult<TConvertPatternSet, TArgumentsCount, TOptions>,
  format: CommandFormat<TConvertPatternSet, TArgumentsCount, TArguments, TOptions>,
  types: ConvertTypeSet<TConvertPatternSet>
): CommandResultOptions<TConvertPatternSet, TOptions> {
  const init: CommandResultOptions<TConvertPatternSet, TOptions> = {};
  return Object.keys(format.options).reduce((prev, curr) => {
    const key = curr as keyof TOptions;
    const value: string | undefined = values.options[key];
    if (!value) return prev;
    const param = {
      name: `オプション ${curr}`,
      description: format.options[key].description,
      value: value,
      convertType: types[format.options[key].type]
    };

    prev[key] = convertParameter(param);
    return prev;
  }, init);
}

export function parseCommand<
  TConvertPatternSet extends ConvertPatternSet,
  TArgumentsCount extends CommandFormatArgumentsCount,
  TArguments extends CommandFormatArguments<TConvertPatternSet, TArgumentsCount>,
  TOptions extends CommandFormatOptions<TConvertPatternSet>
>(
  command: string,
  format: CommandFormat<TConvertPatternSet, TArgumentsCount, TArguments, TOptions>,
  types: ConvertTypeSet<TConvertPatternSet>
): CommandResult<TConvertPatternSet, TArgumentsCount, TArguments, TOptions> | undefined {
  const interpretFormat: InterpretFormat<TConvertPatternSet, TArgumentsCount, TOptions> = {
    prefixes: format.prefixes,
    argumentsCount: format.arguments.length as TArgumentsCount, // It's needed to make sure that value of TArgumentsCount equals "format.arguments.length".
    optionsName: format.options
  } as const;
  const interpretation = interpretCommand<TConvertPatternSet, TArgumentsCount, TOptions>(command, interpretFormat);
  if (!interpretation) return;

  return {
    prefix: interpretation.prefix,
    arguments: convertArguments<TConvertPatternSet, TArgumentsCount, TArguments, TOptions>(
      interpretation,
      format,
      types
    ),
    options: convertOptions<TConvertPatternSet, TArgumentsCount, TArguments, TOptions>(interpretation, format, types)
  };
}
