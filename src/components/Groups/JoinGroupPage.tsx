import * as React from 'react';
import { useContext, useEffect } from 'react';
import UserDataContext from '../../context/UserDataContext/UserDataContext';
import Layout from '../layout';
import SEO from '../seo';
import TopNavigationBar from '../TopNavigationBar/TopNavigationBar';
import useFirebase from '../../hooks/useFirebase';
import { useNotificationSystem } from '../../context/NotificationSystemContext';
import { navigate } from 'gatsby';

const getQuery = name => {
  const url = window.location.href;
  name = name.replace(/[[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

const JoinGroupPage = () => {
  const { firebaseUser, isLoaded, signIn } = useContext(UserDataContext);
  const [groupName, setGroupName] = React.useState<string>(null);
  const [error, setError] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isJoining, setIsJoining] = React.useState(false);
  const firebase = useFirebase();

  const joinKey = typeof window === 'undefined' ? '' : getQuery('key');
  const showLoading = isLoading || !isLoaded || !firebase;
  const showNotSignedInMessage = !showLoading && !firebaseUser?.uid;

  useFirebase(
    firebase => {
      setError(null);
      setIsLoading(true);
      firebase
        .functions()
        .httpsCallable('groups-getJoinKeyInfo')({
          key: joinKey,
        })
        .then(
          ({
            data,
          }: {
            data: {
              success: boolean;
              errorCode?: string;
              message?: string;
              name?: string;
            };
          }) => {
            if (data.success) {
              setGroupName(data.name);
            } else {
              setError({ errorCode: data.errorCode, message: data.message });
            }
          }
        )
        .catch(e => {
          setError(e);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [joinKey]
  );

  return (
    <Layout>
      <SEO title="Join Group" />
      <TopNavigationBar />
      <main>
        <div className="max-w-7xl px-2 sm:px-4 lg:px-8 mx-auto py-16">
          {showNotSignedInMessage && (
            <div>
              <p className="font-medium text-2xl text-center">
                Please{' '}
                <button
                  className="focus:outline-none underline text-blue-600"
                  onClick={() => signIn()}
                >
                  sign in
                </button>{' '}
                to access Groups.
              </p>
            </div>
          )}

          {showLoading && (
            <div>
              <p className="font-medium text-2xl text-center">Loading...</p>
            </div>
          )}

          {error && (
            <div className="mb-8">
              <p className="font-medium text-2xl text-center">
                Error: {error.message}
              </p>
            </div>
          )}

          {!showLoading && !showNotSignedInMessage && groupName && (
            <>
              <p className="text-center text-lg sm:text-2xl">
                Do you want to join the group{' '}
                <span className="font-bold">{groupName}</span>?
              </p>

              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsJoining(true);
                    firebase
                      .functions()
                      .httpsCallable('groups-join')({
                        key: joinKey,
                      })
                      .then(
                        ({
                          data,
                        }: {
                          data: {
                            success: boolean;
                            errorCode?: string;
                            message?: string;
                            groupId?: string;
                          };
                        }) => {
                          if (data.success) {
                            navigate(`/groups/${data.groupId}`);
                          } else {
                            setError({
                              errorCode: data.errorCode,
                              message: data.message,
                            });
                          }
                        }
                      )
                      .catch(e => {
                        setError(e);
                      })
                      .finally(() => setIsJoining(false));
                  }}
                  className="btn-primary"
                  disabled={isJoining}
                >
                  {isJoining ? 'Joining...' : 'Join Group'}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </Layout>
  );
};

export default JoinGroupPage;
