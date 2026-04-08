/**
 * Plain-text formatters for content negotiation (Accept: text/plain) responses.
 */

import type { Project, RecurringTask, SomeDayGroup, Task, UserPreferences } from '@alle/shared';

export function formatTasksAsText(tasks: Task[]): string {
    if (tasks.length === 0) return 'No tasks found.';
    return tasks
        .map(t => {
            const check = t.completed ? '[x]' : '[ ]';
            const date = t.date ? ` (${t.date})` : ' (Someday)';
            const tags = t.tags.length > 0 ? `  ${t.tags.map(tag => `#${tag}`).join(' ')}` : '';
            return `${check} ${t.text}${date}${tags}`;
        })
        .join('\n');
}

export function formatProjectsAsText(projects: Project[]): string {
    if (projects.length === 0) return 'No projects found.';
    return projects
        .map(p => {
            const status = p.isActive ? '[active]' : '[inactive]';
            const due = p.dueDate ? `  due: ${p.dueDate}` : '';
            return `${status} ${p.name}${due}`;
        })
        .join('\n');
}

export function formatGroupsAsText(groups: SomeDayGroup[]): string {
    if (groups.length === 0) return 'No Someday groups found.';
    return groups
        .map(
            g =>
                `[${g.position}] ${g.name} (#${g.tag})${g.description ? `  ${g.description}` : ''}`,
        )
        .join('\n');
}

export function formatRecurringTasksAsText(tasks: RecurringTask[]): string {
    if (tasks.length === 0) return 'No recurring tasks found.';
    return tasks
        .map(t => {
            const freq = t.interval > 1 ? `every ${t.interval} ${t.frequency}` : t.frequency;
            const tags = t.tags.length > 0 ? `  ${t.tags.map(tag => `#${tag}`).join(' ')}` : '';
            return `${t.text} (${freq}, from ${t.startDate}${t.endDate ? ` to ${t.endDate}` : ''})${tags}`;
        })
        .join('\n');
}

export function formatTagsAsText(tags: string[]): string {
    if (tags.length === 0) return 'No tags found.';
    return tags.join('\n');
}

export function formatPreferencesAsText(prefs: UserPreferences): string {
    return [
        `theme: ${prefs.theme}`,
        `locale: ${prefs.locale}`,
        `rolloverEnabled: ${prefs.rolloverEnabled}`,
        `showEmptyDays: ${prefs.showEmptyDays}`,
        `someDayPanelWidth: ${prefs.someDayPanelWidth}`,
        `someDayPanelCollapsed: ${prefs.someDayPanelCollapsed}`,
    ].join('\n');
}
