export const parseCommand = (inputValue: string) => {
  const [match, keyword, query] = inputValue.match(/^([a-zA-Z]{1,2})>(.*)/) || [];
  return {
    didMatch: match !== undefined,
    keyword: keyword?.toLowerCase() || "",
    query: query || "",
  };
};
