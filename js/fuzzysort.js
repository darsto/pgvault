/* SPDX-License-Identifier: MIT
 * Copyright(c) 2024 Darek Stojaczyk
 */

'use strict';

// Returns a number representing a similarity between two strings.
// The higher the number, the higher the similarity.
// Always 0 if one the strings is empty (even if both are).
// Always returns the same value for (a,b) and (b,a).
// Note that the similarity doesn't go further down with more mistyped
// characters. To make the returned value more relevant, it should be
// compared against its input lengths.
//
//   string_similarity("Q", "Quality") = 5
//   string_similarity("q", "Quality") = 1
//   string_similarity("a", "Quality") = 2
//   string_similarity("al", "Quality") = 4
//   string_similarity("at", "Quality") = 2
//   string_similarity("aT", "Quality") = 2
//   string_similarity("w", "Quality") = 0
//   string_similarity("W", "Quality") = 0
//   string_similarity("Qa", "Quality") = 5
//   string_similarity("Qal", "Quality") = 7
//   string_similarity("Qaul", "Quality") = 6
//   string_similarity("Qual", "Quality") = 11
//
// `do_append_whitespace` can be set to true to effectively append
// a whitespace to both strings, which can bring the following diff:
// without:
//   string_similarity("Quality", "Quality") = 17
//   string_similarity("Quality", "Quality Word") = 17
//   string_similarity("Quality", "Qualityword") = 17
// with:
//   string_similarity("Quality", "Quality", true) = 20
//   string_similarity("Quality", "Quality Word", true) = 20
//   string_similarity("Quality", "Qualityword", true) = 17
const string_similarity = (a, b, do_append_whitespace = false) => {
	let i, j;

	// Compare every combination of subsequent characters from both strings,
	// but always in the original order. We'll store results in an array.
	// We do +2 to array width/height:
	// 1) +1 so first row/column is always 0, and we can then read the
	//    "previous" row/column without making a special case
	// 2) +1 so we can effectively append a whitespace to both strings, so
	//    that "word" and "word" have better similarity than "word" and "wording".
	//    Currently this is done only when string length is > 3 (otherwise the
	//    extra byte we allocate here stays unused).
	const scores = new Array((a.length + 2) * (b.length + 2));
	const rowsize = b.length + 2;
	for (i = 0; i < a.length + 2; i++) {
		scores[i * rowsize] = 0;
	}
	for (j = 0; j < rowsize; j++) {
		scores[j] = 0;
	}

	let max = 0;
	const alen = do_append_whitespace ? (a.length + 2) : (a.length + 1);
	const blen = do_append_whitespace ? (b.length + 2) : (b.length + 1);
	for (i = 1; i < alen; i++) {
		const achar = (i < a.length + 1) ? a.charAt(i - 1) : ' ';
		for (j = 1; j < blen; j++) {
			const bchar = (j < b.length + 1) ? b.charAt(j - 1) : ' ';

			let score;
			if (achar == bchar) {
				score = scores[(i - 1) * rowsize + j - 1];
				if (achar == ' ') {
					// matching whitespace, score +3
					score += 3;
				} else if (achar < 'a' || achar > 'z') {
					// same char, uppercase/number/special -> score +5
					score += 5;
				} else {
					// same char, normal lowerscase -> score +2
					score += 2;
				}
			} else if (achar.toLowerCase() == bchar.toLowerCase()) {
				// same char, different case -> score +1
				const prev = scores[(i - 1) * rowsize + j - 1];
				score = prev + 1;
			} else {
				const max = Math.max(scores[i * rowsize + j - 1], scores[(i - 1) * rowsize + j]);
				score = max;
				if ((achar >= 'a' && achar <= 'z') && (bchar >= 'a' && bchar <= 'z')) {
					// a mistyped lowercase char, -1
					score -= 1;
				} else {
					// a very unfortunate typo, most likely the score won't recover
					// (especially with short inputs), but there's still a chance
					score -= 2;
				}
			}
			scores[i * rowsize + j] = score;
			max = Math.max(max, score);
		}
	}

	// we return something similar to longest common subsequence, but since
	// the matching score goes down in our subsequences, we don't look just at
	// the end. Instead, we take the highest matching score wherever it was
	// (or possibly our initial 0, if that's the maximum).
	return max;
}

if (typeof module !== "undefined") {
	module.exports = {
		string_similarity
	}
}
