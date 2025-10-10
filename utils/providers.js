// export const PROVIDERS = {
//   qwen: {
//     name: "Qwen",
//     max_tokens: 128_000,
//     id: "qwen",
//   },
// };

export const MODELS = [
  {
    value: "deepseek-v3.2-exp",
    label: "Deepseek-V3.2-exp",
    providers: ["qwen"],
    autoProvider: "qwen",
    isNew: true
  },
  {
    value: "qwen3-coder-plus",
    label: "Qwen3-Coder",
    providers: ["qwen"],
    autoProvider: "qwen",

  },
  {
    value: "deepseek-v3",
    label: "DeepSeek V3",
    providers: ["qwen"],
    autoProvider: "qwen",
  },
  {
    value: "qwen-plus",
    label: "Qwen-plus",
    providers: ["qwen"],
    autoProvider: "qwen",
  },
  {
    value: "deepseek-r1-0528",
    label: "DeepSeek R1 0528",
    providers: ["qwen"],
    autoProvider: "qwen",
  },
];


// export const PROVIDERS = {
//   "fireworks-ai": {
//     name: "Fireworks AI",
//     max_tokens: 131_000,
//     id: "fireworks-ai",
//   },
//   nebius: {
//     name: "Nebius AI Studio",
//     max_tokens: 131_000,
//     id: "nebius",
//   },
//   sambanova: {
//     name: "SambaNova",
//     max_tokens: 32_000,
//     id: "sambanova",
//   },
//   novita: {
//     name: "NovitaAI",
//     max_tokens: 16_000,
//     id: "novita",
//   },
//   hyperbolic: {
//     name: "Hyperbolic",
//     max_tokens: 131_000,
//     id: "hyperbolic",
//   },
//   together: {
//     name: "Together AI",
//     max_tokens: 128_000,
//     id: "together",
//   },
// };
//
// export const MODELS = [
//   {
//     value: "deepseek-ai/DeepSeek-V3-0324",
//     label: "DeepSeek V3 O324",
//     providers: ["fireworks-ai", "nebius", "sambanova", "novita", "hyperbolic"],
//     autoProvider: "novita",
//   },
//   {
//     value: "deepseek-ai/DeepSeek-R1-0528",
//     label: "DeepSeek R1 0528",
//     providers: [
//       "fireworks-ai",
//       "novita",
//       "hyperbolic",
//       "nebius",
//       "together",
//       "sambanova",
//     ],
//     autoProvider: "novita",
//     isNew: true,
//     isThinker: true,
//   },
// ];
