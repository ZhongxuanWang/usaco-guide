import * as functions from 'firebase-functions';
import admin from 'firebase-admin';
import getPermissionLevel from './utils/getPermissionLevel';
import { GroupData } from '../../../models/groups/groups';
import getMembershipKey from './utils/getMembershipKey';
interface RemoveFromGroupArgs {
  groupId: string;
  targetUid: string;
}

if (admin.apps.length === 0) {
  admin.initializeApp();
}

export default functions.https.onCall(
  async ({ groupId, targetUid }: RemoveFromGroupArgs, context) => {
    const callerUid = context.auth?.uid;

    if (targetUid === callerUid) {
      return {
        success: false,
        errorCode: 'REMOVING_SELF',
      };
    }
    const groupDataSnapshot = await admin
      .firestore()
      .collection('groups')
      .doc(groupId)
      .get();
    if (!groupDataSnapshot.exists) {
      return {
        success: false,
        errorCode: 'GROUP_NOT_FOUND',
      };
    }
    const groupData = groupDataSnapshot.data() as GroupData;
    const permissionLevel = getPermissionLevel(callerUid, groupData);

    if (permissionLevel === 'NOT_MEMBER') {
      return {
        success: false,
        errorCode: 'GROUP_NOT_FOUND',
      };
    }
    if (permissionLevel !== 'OWNER') {
      return {
        success: false,
        errorCode: 'PERMISSION_DENIED',
      };
    }

    const targetPermissionLevel = getPermissionLevel(targetUid, groupData);
    if (targetPermissionLevel === 'NOT_MEMBER') {
      return {
        success: false,
        errorCode: 'MEMBER_NOT_FOUND',
      };
    }

    await admin
      .firestore()
      .collection('groups')
      .doc(groupId)
      .update({
        [getMembershipKey(
          targetPermissionLevel
        )]: admin.firestore.FieldValue.arrayRemove(targetUid),
      });

    return { success: true };
  }
);
