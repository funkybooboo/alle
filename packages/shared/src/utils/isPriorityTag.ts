import { PRIORITY_TAGS } from '../constants';

export function isPriorityTag(tag: string): boolean {
    return PRIORITY_TAGS.includes(tag as (typeof PRIORITY_TAGS)[number]);
}
