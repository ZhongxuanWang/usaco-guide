import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Octokit } from '@octokit/core';
const problemSuggestionCodeowners = {
  general: ['thecodingwizard'],
  bronze: ['caoash'],
  silver: ['andrewwangva'],
  gold: ['caoash'],
  plat: ['nchn27'],
  adv: ['bqi343'],
};

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const submitProblemSuggestion = functions.https.onCall(
  async (data, context) => {
    if (!context.auth?.uid) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You must be logged in to suggest a problem!'
      );
    }
    const submitterName = await admin
      .auth()
      .getUser(context.auth.uid)
      .then(userRecord => userRecord.displayName);

    const {
      name,
      moduleName,
      link,
      difficulty,
      tags,
      additionalNotes,
      problemTableLink,
      section,
    } = data;
    if (!name || !moduleName || !link || !problemTableLink || !section) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'One or more required parameters were not passed.'
      );
    }
    const octokit = new Octokit({
      auth: functions.config().problemsuggestion.issueapikey,
    });
    console.log({
      auth: functions.config().problemsuggestion.issueapikey,
    });

    const body =
      `*${submitterName}* (UID ${context.auth?.uid}) suggested adding the problem [${name}](${link}) ` +
      `to the module [${moduleName}](${problemTableLink}).\n\n` +
      `**Difficulty**: ${difficulty}\n` +
      `**Tags**: ${tags}\n` +
      `**Additional Notes**:${
        additionalNotes ? '\n' + additionalNotes : ' None'
      }\n\n` +
      `*This report was automatically generated from a user submitted problem suggestion on the USACO guide.*`;

    const response = await octokit.request(
      'POST /repos/{owner}/{repo}/issues',
      {
        owner: 'cpinitiative',
        repo: 'usaco-guide',
        title: `Problem Suggestion: Add "${name}" to ${moduleName}`,
        body,
        labels: ['Problem Suggestion'],
        assignees: problemSuggestionCodeowners[section],
      }
    );

    return response.data.html_url;
  }
);
export default submitProblemSuggestion;
