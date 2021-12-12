import { interpretCommand, InterpretResult } from "./interpreter";
import { convertParameter, ConvertType, SupportTypes } from "./converter";
import { CommandFormatArguments, CommandFormatOptions } from "./base-types";

export type ConvertTypeSetBase = {
  readonly [key: string]: ConvertType<SupportTypes>;
};

export type TypeToReturn<TConvertType extends ConvertType<SupportTypes>> = Exclude<
  ReturnType<TConvertType["converter"]>,
  undefined
>;

export type CommandFormatOn<TConvertTypeSet extends ConvertTypeSetBase> = CommandFormat<
  TConvertTypeSet,
  CommandFormatArguments<TConvertTypeSet>,
  CommandFormatOptions<TConvertTypeSet>
>;

export type CommandFormat<
  TConvertTypeSet extends ConvertTypeSetBase,
  TArguments extends CommandFormatArguments<TConvertTypeSet>,
  TOptions extends CommandFormatOptions<TConvertTypeSet>
> = {
  readonly prefixes: readonly string[];
  readonly arguments: TArguments;
  readonly options: TOptions;
};

export type CommandResult<
  TConvertTypeSet extends ConvertTypeSetBase,
  TArguments extends CommandFormatArguments<TConvertTypeSet>,
  TOptions extends CommandFormatOptions<TConvertTypeSet>
> = {
  readonly prefix: string;
  readonly arguments: CommandResultArguments<TConvertTypeSet, TArguments>;
  readonly options: CommandResultOptions<TConvertTypeSet, TOptions>;
};

export type CommandResultOf<
  TConvertTypeSet extends ConvertTypeSetBase,
  TFormat extends CommandFormat<
    TConvertTypeSet,
    CommandFormatArguments<TConvertTypeSet>,
    CommandFormatOptions<TConvertTypeSet>
  >
> = CommandResult<TConvertTypeSet, TFormat["arguments"], TFormat["options"]>;

type Parameter<TConvertTypeSet extends ConvertTypeSetBase = ConvertTypeSetBase> = {
  readonly name: string;
  readonly description: string;
  readonly type: keyof TConvertTypeSet;
};

type CommandResultArguments<
  TConvertTypeSet extends ConvertTypeSetBase,
  TArguments extends CommandFormatArguments<TConvertTypeSet>
> = TArguments[0] extends Parameter<TConvertTypeSet>
  ? TArguments[1] extends Parameter<TConvertTypeSet>
    ? TArguments[2] extends Parameter<TConvertTypeSet>
      ? TArguments[3] extends Parameter<TConvertTypeSet>
        ? TArguments[4] extends Parameter<TConvertTypeSet>
          ? [
              TypeToReturn<TConvertTypeSet[TArguments[0]["type"]]>,
              TypeToReturn<TConvertTypeSet[TArguments[1]["type"]]>,
              TypeToReturn<TConvertTypeSet[TArguments[2]["type"]]>,
              TypeToReturn<TConvertTypeSet[TArguments[3]["type"]]>,
              TypeToReturn<TConvertTypeSet[TArguments[4]["type"]]>
            ]
          : [
              TypeToReturn<TConvertTypeSet[TArguments[0]["type"]]>,
              TypeToReturn<TConvertTypeSet[TArguments[1]["type"]]>,
              TypeToReturn<TConvertTypeSet[TArguments[2]["type"]]>,
              TypeToReturn<TConvertTypeSet[TArguments[3]["type"]]>
            ]
        : [
            TypeToReturn<TConvertTypeSet[TArguments[0]["type"]]>,
            TypeToReturn<TConvertTypeSet[TArguments[1]["type"]]>,
            TypeToReturn<TConvertTypeSet[TArguments[2]["type"]]>
          ]
      : [TypeToReturn<TConvertTypeSet[TArguments[0]["type"]]>, TypeToReturn<TConvertTypeSet[TArguments[1]["type"]]>]
    : [TypeToReturn<TConvertTypeSet[TArguments[0]["type"]]>]
  : [];

export type CommandResultOptions<
  TConvertTypeSet extends ConvertTypeSetBase,
  TOptions extends CommandFormatOptions<TConvertTypeSet>
> = {
  [key in keyof TOptions]?: TypeToReturn<TConvertTypeSet[TOptions[key]["type"]]>;
};

function convertArguments<
  TConvertTypeSet extends ConvertTypeSetBase,
  TFormat extends CommandFormatOn<TConvertTypeSet>
  >(
  values: InterpretResult<TConvertTypeSet, TFormat>,
  format: TFormat,
  types: TConvertTypeSet
): CommandResultArguments<TConvertTypeSet, TFormat["arguments"]> {
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
  return parameters as CommandResultArguments<TConvertTypeSet, TFormat["arguments"]>;
}

function convertOptions<
  TConvertTypeSet extends ConvertTypeSetBase,
  TFormat extends CommandFormatOn<TConvertTypeSet>
>(
  values: InterpretResult<TConvertTypeSet, TFormat>,
  format: TFormat,
  types: TConvertTypeSet
): CommandResultOptions<TConvertTypeSet, TFormat["options"]> {
  let results: CommandResultOptions<TConvertTypeSet, TFormat["options"]> = {};

  const options: TFormat["options"] = format.options;
  for (const key in options) {
    const value: string | undefined = values.options[key];
    if (!value) continue;

    results[key] = convertParameter({
      name: `オプション ${key}`,
      description: options[key].description,
      value,
      convertType: types[options[key].type]
    }) as TypeToReturn<TConvertTypeSet[TFormat["options"][typeof key]["type"]]>;
  }

  return results;
}

export function parseCommand<
  TConvertTypeSet extends ConvertTypeSetBase,
  TFormat extends CommandFormatOn<TConvertTypeSet>
>(command: string, format: TFormat, types: TConvertTypeSet): CommandResultOf<TConvertTypeSet, TFormat> | undefined {
  const interpretFormat = {
    prefixes: format.prefixes,
    argumentsCount: format.arguments,
    optionsName: format.options
  } as const;

  const interpretation = interpretCommand<TConvertTypeSet, TFormat>(
    command,
    interpretFormat
  );
  if (!interpretation) return;

  return {
    prefix: interpretation.prefix,
    arguments: convertArguments(interpretation, format, types),
    options: convertOptions(interpretation, format, types)
  };
}
