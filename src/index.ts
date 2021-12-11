import { parseCommand } from "./command-parser";

const types = {
  integer: {
    name: "整数",
    converter: (value: string) => {
      const num = parseInt(value);
      if (isNaN(num)) return;
      return num;
    }
  },

  float: {
    name: "実数",
    converter: (value: string) => {
      const num = parseFloat(value);
      if (isNaN(num)) return;
      return num;
    }
  },

  string: {
    name: "文字列",
    converter: (value: string) => {
      return value;
    }
  }
} as const;

const format = {
  prefixes: ["/search-message", "/message search"] as const,
  arguments: [
    {
      name: "テスト文字列（引数1）",
      description: "文字列を入力してね（必須）",
      type: "string"
    },
    {
      name: "テスト実数（引数2）",
      description: "実数を入力してね（必須）",
      type: "float"
    },
    {
      name: "テスト整数（引数3）",
      description: "整数を入力してね（必須）",
      type: "integer"
    }
  ] as const,
  options: {
    content: {
      name: "テスト文字列（オプション）",
      description: "文字列を入力してね（任意）",
      type: "string"
    } as const,
    page: {
      name: "テスト整数（オプション）",
      description: "整数を入力してね（任意）",
      type: "integer"
    } as const
  } as const
} as const;

const commands = [
  "/search-message aaaaa 11.1 100 --content alpha --page 3",
  "/message search bbbbb 22.2 200",
  "/search-message ccccc 33.3 300 --content gamma",
  "/create-message ddddd 44.4 400 --content gamma",
  "/search-message ddddd 55.5 3.14159 --content gamma",
  "/search-message eeeee 66.6 600 1209 --content gamma",
  "/search-message fffff 77.7 --content gamma",
  "/search-message ggggg 88.8 800 --content gamma --animal dog",
  "/search-message iiiii mmmmm 900 --content gamma",
  "/search-message 111 99.9 1000 --page hoge"
];

for (const command of commands) {
  console.log(command);
  try {
    const values = parseCommand(command, format, types);
    console.log(values);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.log("unknown error");
    }
  }
  console.log();
}
