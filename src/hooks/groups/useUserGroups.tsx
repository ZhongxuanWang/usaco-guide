import * as React from 'react';
import { ReactElement, ReactNode } from 'react';
import ReactDOM from 'react-dom';
import UserDataContext from '../../context/UserDataContext/UserDataContext';
import { groupConverter, GroupData } from '../../models/groups/groups';
import useFirebase from '../useFirebase';

const UserGroupsContext = React.createContext<{
  isLoading: boolean;
  isSuccess: boolean;
  data: null | GroupData[];
  /**
   * Call when you want to re-fetch groups
   */
  invalidateData: () => void;
}>(null);

const UserGroupsProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const { firebaseUser } = React.useContext(UserDataContext);
  const [isLoading, setIsLoading] = React.useState(!!firebaseUser?.uid);
  const [groups, setGroups] = React.useState<null | GroupData[]>(null);
  const [updateCtr, setUpdateCtr] = React.useState(0);

  useFirebase(
    firebase => {
      if (!firebaseUser?.uid) {
        setIsLoading(false);
        setGroups(null);
        return;
      }
      setIsLoading(true);

      let queries = {
        ownerIds: null,
        memberIds: null,
        adminIds: null,
      };

      Object.keys(queries).forEach(key => {
        firebase
          .firestore()
          .collection('groups')
          .where(key, 'array-contains', firebaseUser?.uid)
          .withConverter(groupConverter)
          .get()
          .then(snap => {
            queries[key] = snap.docs.map(doc => doc.data());

            if (Object.keys(queries).every(x => queries[x] !== null)) {
              setGroups(Object.values(queries).flat());
              setIsLoading(false);
            }
          });
      });
    },
    [firebaseUser?.uid, updateCtr]
  );

  return (
    <UserGroupsContext.Provider
      value={{
        isLoading,
        isSuccess: groups !== null,
        data: groups,
        invalidateData: () => {
          setIsLoading(true);
          setUpdateCtr(updateCtr + 1);
        },
      }}
    >
      {children}
    </UserGroupsContext.Provider>
  );
};

const useUserGroups = () => {
  const userGroups = React.useContext(UserGroupsContext);
  if (userGroups === null) {
    throw 'useUserGroups must be used within a UserGroupsProvider';
  }
  return userGroups;
};

export { UserGroupsProvider, useUserGroups };
