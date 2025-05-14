declare module "@emoji-mart/data" {
  // The dataset is a large JSON object; exact shape is not needed at compile-time
  const data: Record<string, unknown>;
  export default data;
}
