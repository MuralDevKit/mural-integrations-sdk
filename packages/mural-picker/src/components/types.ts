import { EventHandler } from '@muraldevkit/mural-integrations-common';

export type ErrorHandler = EventHandler<[error: Error, message: string]>;
