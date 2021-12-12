import { SupportTypes } from "./converter";

export type ConvertPatternSet = { [name: string]: SupportTypes };

type Parameter<TConvertPatternSet extends ConvertPatternSet = ConvertPatternSet> = {
  readonly name: string;
  readonly description: string;
  readonly type: keyof TConvertPatternSet;
};

export type CountOf<
  TConvertPatternSet extends ConvertPatternSet,
  TCommandFormatArguments extends CommandFormatArguments<TConvertPatternSet>
> =
  TCommandFormatArguments["length"];

export type CommandFormatArguments<TConvertPatternSet extends ConvertPatternSet> =
  | readonly []
  | readonly [Parameter<TConvertPatternSet>]
  | readonly [Parameter<TConvertPatternSet>, Parameter<TConvertPatternSet>]
  | readonly [Parameter<TConvertPatternSet>, Parameter<TConvertPatternSet>, Parameter<TConvertPatternSet>]
  | readonly [
    Parameter<TConvertPatternSet>,
    Parameter<TConvertPatternSet>,
    Parameter<TConvertPatternSet>,
    Parameter<TConvertPatternSet>
  ]
  | readonly [
    Parameter<TConvertPatternSet>,
    Parameter<TConvertPatternSet>,
    Parameter<TConvertPatternSet>,
    Parameter<TConvertPatternSet>,
    Parameter<TConvertPatternSet>
  ];

export type CommandFormatOptions<TConvertPatternSet extends ConvertPatternSet> = {
  readonly [key: string]: Parameter<TConvertPatternSet>;
};
