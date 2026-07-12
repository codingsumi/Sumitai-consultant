import {prompt} from "./prompt";
import {llm} from "./model";

export const chain = prompt.pipe(llm);