import firebaseType from 'firebase';
import { Leaderboard } from './leaderboard';

export type GroupData = {
  id: string;
  name: string;
  description: string;
  ownerIds: string[];
  adminIds: string[];
  memberIds: string[];
  leaderboard: Leaderboard;
};

export enum GroupPermission {
  MEMBER = 'member',
  ADMIN = 'admin',
  OWNER = 'owner',
}

export type JoinGroupLink = {
  id: string;
  groupId: string;
  revoked: boolean;
  numUses: number;
  maxUses: number | null;
  expirationTime: firebaseType.firestore.Timestamp | null;
  usedBy: string[];
  author: string;
};

export const groupConverter = {
  toFirestore(
    group: Omit<GroupData, 'id'>
  ): firebaseType.firestore.DocumentData {
    return {
      name: group.name,
      description: group.description,
      ownerIds: group.ownerIds,
      adminIds: group.ownerIds,
      memberIds: group.ownerIds,
    };
  },

  fromFirestore(
    snapshot: firebaseType.firestore.QueryDocumentSnapshot,
    options: firebaseType.firestore.SnapshotOptions
  ): GroupData {
    return {
      ...snapshot.data(options),
      id: snapshot.id,
    } as GroupData;
  },
};

export const joinGroupLinkConverter = {
  toFirestore(link: JoinGroupLink): firebaseType.firestore.DocumentData {
    const { id, ...data } = link;
    return data;
  },

  fromFirestore(
    snapshot: firebaseType.firestore.QueryDocumentSnapshot,
    options: firebaseType.firestore.SnapshotOptions
  ): JoinGroupLink {
    return {
      ...snapshot.data(options),
      id: snapshot.id,
    } as JoinGroupLink;
  },
};

export const isUserAdminOfGroup = (group: GroupData, userId: string) => {
  return (
    !!group?.adminIds.includes(userId) || !!group?.ownerIds.includes(userId)
  );
};
