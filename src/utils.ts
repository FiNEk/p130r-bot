import { isEmpty, isNil } from "lodash";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isNullishOrEmpty(val: any): val is null | undefined {
  return isNil(val) || isEmpty(val);
}
