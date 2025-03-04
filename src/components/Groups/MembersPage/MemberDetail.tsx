import * as React from 'react';
import { MemberInfo } from '../../../hooks/groups/useMemberInfoForGroup';
import { useActiveGroup } from '../../../hooks/groups/useActiveGroup';
import { useGroupActions } from '../../../hooks/groups/useGroupActions';
import { useNotificationSystem } from '../../../context/NotificationSystemContext';
import getPermissionLevel from '../../../functions/src/groups/utils/getPermissionLevel';
import UserDataContext from '../../../context/UserDataContext/UserDataContext';
import { useContext } from 'react';
export default function MemberDetail({ member }: { member: MemberInfo }) {
  const activeGroup = useActiveGroup();
  const { removeMemberFromGroup, updateMemberPermissions } = useGroupActions();
  const notifications = useNotificationSystem();
  const {
    firebaseUser: { uid: userId },
  } = useContext(UserDataContext);
  const getTotalPointsForMember = (memberId: string) => {
    let total = 0;
    Object.keys(activeGroup.groupData.leaderboard || {}).forEach(postId => {
      Object.keys(activeGroup.groupData.leaderboard[postId]).forEach(
        problemId => {
          total +=
            activeGroup.groupData.leaderboard[postId][problemId][memberId]
              ?.bestScore || 0;
        }
      );
    });
    return total;
  };

  if (!member) {
    return (
      <p className="mt-8 text-xl text-center">
        This member has been removed from the group.
      </p>
    );
  }
  const permissionLevel = getPermissionLevel(member.uid, activeGroup.groupData);

  return (
    <article>
      {/* Profile header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 md:flex md:items-center md:justify-between md:space-x-5 mt-6">
        <div className="flex items-start space-x-5">
          <div className="flex-shrink-0">
            <div className="relative">
              <img
                className="h-16 w-16 rounded-full"
                src={member.photoURL}
                alt={member.displayName}
              />
              <span
                className="absolute inset-0 shadow-inner rounded-full"
                aria-hidden="true"
              ></span>
            </div>
          </div>
          {/*
          Use vertical padding to simulate center alignment when both lines of text are one line,
          but preserve the same layout if the text wraps without making the image jump around.
        */}
          <div className="pt-1.5">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {member.displayName}
            </h1>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-300">
              {getTotalPointsForMember(member.uid)} Points Earned
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      {/*<div className="mt-6 sm:mt-2 2xl:mt-5">*/}
      {/*  <div className="border-b border-gray-200">*/}
      {/*    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">*/}
      {/*      <nav className="-mb-px flex space-x-8" aria-label="Tabs">*/}
      {/*        /!* Current: "border-pink-500 text-indigo-600", Default: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" *!/*/}
      {/*        <a href="/" className="border-pink-500 text-gray-900 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm" aria-current="page">*/}
      {/*          Profile*/}
      {/*        </a>*/}
      {/*        <a href="/" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">*/}
      {/*          Calendar*/}
      {/*        </a>*/}
      {/*        <a href="/" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">*/}
      {/*          Recognition*/}
      {/*        </a>*/}
      {/*      </nav>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</div>*/}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 my-6">
        {member.uid !== userId && (
          <div className="space-x-4 mt-8">
            <button
              type="button"
              className="btn"
              onClick={() => {
                if (
                  confirm(
                    'Are you sure you want to remove this member from the group?'
                  )
                ) {
                  removeMemberFromGroup(activeGroup.activeGroupId, member.uid)
                    .then(() =>
                      notifications.addNotification({
                        level: 'success',
                        message:
                          'This member has been successfully removed from the group.',
                      })
                    )
                    .catch(notifications.showErrorNotification);
                }
              }}
            >
              Remove From Group
            </button>

            {(['OWNER', 'ADMIN', 'MEMBER'] as ('OWNER' | 'ADMIN' | 'MEMBER')[])
              .filter(p => p !== permissionLevel)
              .map(newPermission => (
                <button
                  key={newPermission}
                  className="btn"
                  onClick={() => {
                    if (
                      confirm(
                        `Are you sure you want to ${
                          ['OWNER', 'ADMIN', 'MEMBER'].indexOf(newPermission) <
                          ['OWNER', 'ADMIN', 'MEMBER'].indexOf(permissionLevel)
                            ? 'promote'
                            : 'demote'
                        } ${
                          member.displayName
                        } to ${newPermission.toLowerCase()}?`
                      )
                    ) {
                      updateMemberPermissions(
                        activeGroup.activeGroupId,
                        member.uid,
                        newPermission
                      )
                        .then(() =>
                          notifications.addNotification({
                            level: 'success',
                            message: `${member.displayName} now has permission level ${newPermission}.`,
                          })
                        )
                        .catch(notifications.showErrorNotification);
                    }
                  }}
                >
                  {['OWNER', 'ADMIN', 'MEMBER'].indexOf(newPermission) <
                  ['OWNER', 'ADMIN', 'MEMBER'].indexOf(permissionLevel)
                    ? 'Promote'
                    : 'Demote'}{' '}
                  to{' '}
                  {newPermission.charAt(0).toUpperCase() +
                    newPermission.substring(1).toLowerCase()}
                </button>
              ))}
          </div>
        )}
        <hr className="dark:border-gray-700 my-6" />
        <p>Future feature: View user progress on all problems/assignments!</p>
      </div>
    </article>
  );
}
