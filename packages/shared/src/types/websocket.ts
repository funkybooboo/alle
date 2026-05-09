import type { Project } from './project';
import type { Task } from './task';

export type WsServerEventType =
    | 'connection:ack'
    | 'task:created'
    | 'task:updated'
    | 'task:deleted'
    | 'task:restored'
    | 'tag:renamed'
    | 'tag:merged'
    | 'project:created'
    | 'project:updated'
    | 'project:deleted'
    | 'someDayGroup:created'
    | 'someDayGroup:updated'
    | 'someDayGroup:deleted'
    | 'recurringTask:generated'
    | 'server:shutdown';

export type WsClientEventType = 'ws:ping';

export type WsServerMessage =
    | { type: 'connection:ack'; payload: ConnectionAckPayload; originClientId?: string }
    | { type: 'task:created'; payload: { task: Task }; originClientId?: string }
    | { type: 'task:updated'; payload: { task: Task }; originClientId?: string }
    | { type: 'task:deleted'; payload: { id: string }; originClientId?: string }
    | { type: 'task:restored'; payload: { task: Task }; originClientId?: string }
    | { type: 'tag:renamed'; payload: TagRenamedPayload; originClientId?: string }
    | { type: 'tag:merged'; payload: TagMergedPayload; originClientId?: string }
    | { type: 'project:created'; payload: { project: Project }; originClientId?: string }
    | { type: 'project:updated'; payload: { project: Project }; originClientId?: string }
    | { type: 'project:deleted'; payload: { id: string }; originClientId?: string }
    | { type: 'someDayGroup:created'; payload: { group: unknown }; originClientId?: string }
    | { type: 'someDayGroup:updated'; payload: { group: unknown }; originClientId?: string }
    | { type: 'someDayGroup:deleted'; payload: { id: string }; originClientId?: string }
    | {
          type: 'recurringTask:generated';
          payload: RecurringTaskGeneratedPayload;
          originClientId?: string;
      }
    | { type: 'server:shutdown'; payload: ServerShutdownPayload; originClientId?: string };

export interface WsClientMessage {
    type: WsClientEventType;
    payload?: Record<string, unknown>;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'reconnecting';

export interface ConnectionAckPayload {
    clientId: string;
    serverTime: string;
}

export interface ServerShutdownPayload {
    reason: string;
    graceMs: number;
}

export interface TagRenamedPayload {
    from: string;
    to: string;
    updated: number;
}

export interface TagMergedPayload {
    sources: string[];
    target: string;
    updated: number;
}

export interface RecurringTaskGeneratedPayload {
    tasks: Task[];
    recurringTaskId: string;
}

export const WS_RECONNECT_BASE_MS = 500;
export const WS_RECONNECT_MAX_MS = 10_000;
export const WS_PING_INTERVAL_MS = 30_000;
export const WS_PING_TIMEOUT_MS = 5_000;
