import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-text-difference',
  templateUrl: './text-difference.component.html',
  styleUrls: ['./text-difference.component.scss']
})
export class TextDifferenceComponent implements OnInit {

  public results: any[] = [];

  constructor() {

    const checks = [
      [
        'ABCD',
        'AFKD'
      ],
      [
        'I am waiting for a snow.',
        'I\'ve been waiting for snow.'
      ],
      [
        'breakfast I had tooday was awsome.',
        'the breakfast I had today was awesome.'
      ]
    ];

    for (let i = 0; i < checks.length; i++) {
      const res = findTextDifference(checks[i][0], checks[i][1], i > 0);
      this.results.push({
        original: checks[i][0],
        changed: checks[i][1],
        lcs: res.lcs,
        added: res.added,
        deleted: res.deleted,
        combined: res.combined,
      });
    }

  }

  ngOnInit() {
  }
}

/* Input:
 * - s1: the first string (the original string)
 * - s2: the second string (the edited string)
 * - splitByWords: true if we want to compare s1 and s2
 *       by words instead of by characters.
 *
 * Output:
 * {lcs: the longest common subsequence between s1 and s2,
 *  deleted: an HTML snippet that shows which parts of s1 have been deleted,
 *  added: an HTML snippet that shows which parts of s2 have been added}
 */
function findTextDifference(
  originalText: string,
  changedText: string,
  splitByWords: boolean
): { deleted: any[], added: any[], combined: any[], lcs: string } {
  let commonPhrases;

  if (splitByWords) {
    // This splits s1 and s2 by words.
    const reg = /([ .,])/g;
    const originalWords = originalText.split(reg);
    const changedWords = changedText.split(reg);
    commonPhrases = longestCommonSubsequence(originalWords, changedWords);
  } else {
    commonPhrases = longestCommonSubsequence(originalText, changedText);
  }

  return getDifferenceStrings(commonPhrases, originalText, changedText);
}

function getDifferenceStrings(commonPhrases, originalText, changedText) {

  const deleted = [];
  const added = [];
  const combined = [];

  let i1 = 0;
  let i1Next = 0;
  let i2 = 0;
  let i2Next = 0;

  let deletedText: string;
  let addedText: string;

  for (let i = 0; i < commonPhrases.length; i++) {
    i1Next = originalText.indexOf(commonPhrases[i], i1);
    i2Next = changedText.indexOf(commonPhrases[i], i2);

    deletedText = originalText.substring(i1, i1Next);
    addedText = changedText.substring(i2, i2Next);

    pushResult(deleted, deletedText, 'deleted');
    pushResult(added, addedText, 'added');
    pushResult(combined, deletedText, 'deleted');
    pushResult(combined, addedText, 'added');

    pushResult(deleted, commonPhrases[i], 'unchanged');
    pushResult(added, commonPhrases[i], 'unchanged');
    pushResult(combined, commonPhrases[i], 'unchanged');

    i1 = i1Next + 1;
    i2 = i2Next + 1;
  }

  deletedText = originalText.substring(i1);
  addedText = changedText.substring(i2);

  pushResult(deleted, deletedText, 'deleted');
  pushResult(added, addedText, 'added');

  pushResult(combined, deletedText, 'deleted');
  pushResult(combined, addedText, 'added');

  return {
    lcs: commonPhrases,
    deleted,
    added,
    combined
  };
}

function pushResult(
  resultArray: any[],
  text: string,
  type: 'unchanged' | 'added' | 'deleted') {

  if (!text) {
    return;
  }

  const lastItem = resultArray[resultArray.length - 1];
  if (lastItem && lastItem.type === type) {
    lastItem.text += text;
  } else {
    resultArray.push({type, text});
  }

}

// A dynamic programming (memoized) approach
// to find a longest common subsequence between s1 and s2.
// s1 and s2 could be either strings or arrays of strings.
function longestCommonSubsequence(a: string[] | string, b: string[] | string): string {
  const memo = [...new Array(a.length).fill(undefined)].map(_ => new Array(b.length).fill(undefined));
  return helper(a, b, 0, 0, memo);
}

function helper(a: string[] | string,
                b: string[] | string,
                m: number,
                n: number,
                memo: any[][]): string {
  if (m === a.length || n === b.length) {
    return '';
  }

  if (memo[m][n] !== undefined) {
    return memo[m][n];
  }

  if (a[m] === b[n]) {
    memo[m][n] = a[m] + helper(a, b, m + 1, n + 1, memo);
    return memo[m][n];
  }

  const lcs1 = helper(a, b, m + 1, n, memo);
  const lcs2 = helper(a, b, m, n + 1, memo);

  memo[m][n] = lcs1.length > lcs2.length
    ? lcs1
    : lcs2;

  return memo[m][n];
}

