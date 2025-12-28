declare module '@elizaos/core' {
  export type UUID = string;
  export type Agent = Record<string, any>;
  export type Character = Record<string, any>;
  export type Room = Record<string, any>;
  export type Memory = Record<string, any>;
  export type Media = Record<string, any>;
  export type Content = Record<string, any>;

  export type AgentStatus = string;
  export const AgentStatus: {
    ACTIVE: 'active';
    INACTIVE: 'inactive';
    [key: string]: string;
  };

  export type ChannelType = string;
  export namespace ChannelType {
    export type DM = 'DM';
    export type GROUP = 'GROUP';
    export const DM: DM;
    export const GROUP: GROUP;
  }

  export type ContentType = string;
  export const ContentType: {
    IMAGE: 'image';
    VIDEO: 'video';
    AUDIO: 'audio';
    DOCUMENT: 'document';
    LINK: 'link';
    [key: string]: string;
  };

  export const SOCKET_MESSAGE_TYPE: {
    ROOM_JOINING: string;
    SEND_MESSAGE: string;
    [key: string]: string;
  };

  export const elizaLogger: {
    info: (...args: any[]) => void;
    error: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    debug: (...args: any[]) => void;
  };

  export function validateUuid(value: unknown): UUID | null;
  export function decryptObjectValues<T = any>(value: T, salt: string): T;
  export function getSalt(): string;
  export function getContentTypeFromMimeType(mimeType: string): ContentType | undefined;
}
