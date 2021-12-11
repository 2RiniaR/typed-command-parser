import { SupportTypes } from "./converter";

export type ConvertPatternSet = { [name: string]: SupportTypes };

type Parameter<TConvertPatternSet extends ConvertPatternSet = ConvertPatternSet> = {
  readonly name: string;
  readonly description: string;
  readonly type: keyof TConvertPatternSet;
};

export type CommandFormatArgumentsCount = 0 | 1 | 2 | 3 | 4 | 5;

export type CommandFormatArguments<
  TConvertPatternSet extends ConvertPatternSet,
  TCount extends CommandFormatArgumentsCount
> = {
  0: readonly [];
  1: readonly [Parameter<TConvertPatternSet>];
  2: readonly [Parameter<TConvertPatternSet>, Parameter<TConvertPatternSet>];
  3: readonly [Parameter<TConvertPatternSet>, Parameter<TConvertPatternSet>, Parameter<TConvertPatternSet>];
  4: readonly [
    Parameter<TConvertPatternSet>,
    Parameter<TConvertPatternSet>,
    Parameter<TConvertPatternSet>,
    Parameter<TConvertPatternSet>
  ];
  5: readonly [
    Parameter<TConvertPatternSet>,
    Parameter<TConvertPatternSet>,
    Parameter<TConvertPatternSet>,
    Parameter<TConvertPatternSet>,
    Parameter<TConvertPatternSet>
  ];
}[TCount];

export type CommandFormatOptions<TConvertPatternSet extends ConvertPatternSet> = {
  readonly [key: string]: Parameter<TConvertPatternSet>;
};
