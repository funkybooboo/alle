import type {
    CreateProjectInput,
    Project,
    UpdateProjectInput,
    WsServerMessage,
} from '@alle/shared';
import { container } from '$lib/container';
import { ProjectService } from '$lib/services/projectService';
import { websocketService } from '$lib/services/websocketService';

const projectService = new ProjectService(container.httpClient);

class ProjectStore {
    projects = $state<Project[]>([]);
    #messageUnsubscribe: (() => void) | null = null;

    initWebSocket(): void {
        this.#messageUnsubscribe = websocketService.onMessage((message: WsServerMessage) => {
            const myClientId = websocketService.getClientId();
            if (message.originClientId === myClientId) return;

            switch (message.type) {
                case 'project:created':
                    if (message.payload.project) {
                        this.projects = [...this.projects, message.payload.project];
                    }
                    break;
                case 'project:updated':
                    if (message.payload.project) {
                        this.projects = this.projects.map(p =>
                            p.id === message.payload.project.id ? message.payload.project : p,
                        );
                    }
                    break;
                case 'project:deleted':
                    this.projects = this.projects.filter(p => p.id !== message.payload.id);
                    break;
            }
        });
    }

    destroyWebSocket(): void {
        this.#messageUnsubscribe?.();
        this.#messageUnsubscribe = null;
    }

    async fetchAll() {
        try {
            const projects = await projectService.getAll();
            this.projects = projects;
        } catch {
            // Keep empty state
        }
    }

    async create(input: CreateProjectInput) {
        try {
            const project = await projectService.create(input);
            this.projects = [...this.projects, project];
            return project;
        } catch {
            return null;
        }
    }

    async update(id: string, input: UpdateProjectInput) {
        try {
            const updated = await projectService.update(id, input);
            this.projects = this.projects.map(p => (p.id === id ? updated : p));
            return updated;
        } catch {
            return null;
        }
    }

    async remove(id: string) {
        try {
            await projectService.delete(id);
            this.projects = this.projects.filter(p => p.id !== id);
            return true;
        } catch {
            return false;
        }
    }
}

export const projectStore = new ProjectStore();
