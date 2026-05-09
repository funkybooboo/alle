import { PRIORITY_TAGS } from '../constants';
import type { TagKind } from '../types/userPreferences';

export function isPriorityTag(tag: string): boolean {
    return PRIORITY_TAGS.includes(tag as (typeof PRIORITY_TAGS)[number]);
}

export function resolveTagKind(
    tag: string,
    tagKinds: TagKind[],
    tagKindMap: Record<string, string>,
): TagKind | null {
    const explicit = tagKindMap[tag];
    if (explicit) {
        return tagKinds.find(k => k.id === explicit) ?? null;
    }
    for (const kind of tagKinds) {
        if (kind.prefix && tag.startsWith(kind.prefix)) {
            return kind;
        }
    }
    return null;
}

export function getTagsByKind(
    allTags: string[],
    tagKinds: TagKind[],
    tagKindMap: Record<string, string>,
): Map<TagKind | null, string[]> {
    const result = new Map<TagKind | null, string[]>();
    for (const tag of allTags) {
        const kind = resolveTagKind(tag, tagKinds, tagKindMap);
        const existing = result.get(kind) ?? [];
        existing.push(tag);
        result.set(kind, existing);
    }
    return result;
}

export function getKindValues(
    kind: TagKind,
    allTags: string[],
    tagKindMap: Record<string, string>,
): string[] {
    return allTags.filter(tag => resolveTagKind(tag, [kind], tagKindMap) !== null);
}
