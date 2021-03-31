import * as React from 'react';
import UserDataContext from '../../context/UserDataContext/UserDataContext';
import useFirebase from '../useFirebase';
import { useActiveGroup } from './useActiveGroup';
import { Submission, submissionConverter } from '../../models/groups/problem';

export default function useUserProblemSubmissions(
  postId: string,
  problemId: string
) {
  const { firebaseUser } = React.useContext(UserDataContext);
  const [submissions, setSubmissions] = React.useState<Submission[]>(null);
  const activeGroup = useActiveGroup();

  useFirebase(
    firebase => {
      if (problemId && firebaseUser?.uid && activeGroup?.activeGroupId) {
        return firebase
          .firestore()
          .collection('groups')
          .doc(activeGroup.activeGroupId)
          .collection('posts')
          .doc(postId)
          .collection('problems')
          .doc(problemId)
          .collection('submissions')
          .where('userId', '==', firebaseUser.uid)
          .withConverter(submissionConverter)
          .onSnapshot(snap => {
            setSubmissions(
              snap.docs
                .map(doc => doc.data())
                .sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis())
            );
          });
      }
    },
    [firebaseUser?.uid, postId, problemId, activeGroup?.activeGroupId]
  );

  return submissions;
}
