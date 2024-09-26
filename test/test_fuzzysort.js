const fuzzysort = require('../js/fuzzysort.js');
const test_similarity = (a, b, do_append_whitespace = false) => {
    let append = "";
    if (do_append_whitespace) {
        append = ", true";
    }
    const similarity_dist = fuzzysort.string_similarity(a, b, do_append_whitespace);
    console.log("string_similarity(\"" + a + "\", \"" + b + "\"" + append + ") = " + similarity_dist);
    console.log("string_similarity(\"" + b + "\", \"" + a + "\"" + append + ") = " + fuzzysort.string_similarity(b, a, do_append_whitespace));
}

test_similarity("skin", "Skin");
test_similarity("Skin", "Skin");

test_similarity("Ski", "Amutasa's Skinning Knife");
test_similarity("Ski", "Astounding Skinning Knife");
test_similarity("Skin", "Astounding Skinning Knife");
test_similarity("Ski", "Amazing Animal Skin");
test_similarity("Skin", "Amutasa's Skinning Knife");
test_similarity("skin", "Amutasa's Skinning Knife");
test_similarity("Skin", "Stoneskin Potion");
test_similarity("Skin", "Abrasive Sand");
test_similarity("Skin", "Basic Stoneskin Potion");
test_similarity("skin", "Basic Stoneskin Potion");

test_similarity("Skin", "Orcish Thickskin Potion");
test_similarity("Skin", "Nice Animal Skin");
test_similarity("word", "word");
test_similarity("W", "wording");
test_similarity("", "");

test_similarity("Ri-S", "Ri-S");
test_similarity("Ri-S", "Peppy Awesome Ri-Shin Coat of Aneurysms");
test_similarity("Ri-S", "Ri-Shin Coat");
test_similarity("Ri-Sh", "Ri-Sh");
test_similarity("Ri-Sh", "Peppy Awesome Ri-Shin Coat of Aneurysms");
test_similarity("Ri-Shi", "Ri-Shi");
test_similarity("Ri-Shi", "Peppy Awesome Ri-Shin Coat of Aneurysms");

test_similarity("Skil", "Skil");
test_similarity("Skil", "Skull");

test_similarity("", "Skull");
test_similarity("", "Amutasa's Skinning Knife");
test_similarity("", "Peppy Awesome Ri-Shin Coat of Aneurysms");
test_similarity("q", "Skull");
test_similarity("R", "Skull");
test_similarity("R", "Amutasa's Skinning Knife");
test_similarity("Ri", "Skull");
test_similarity("Ri", "Amutasa's Skinning Knife");
test_similarity("Ri-", "Skull");
test_similarity("Ri-", "Amutasa's Skinning Knife");
test_similarity("Ri-S", "Skull");
test_similarity("Ri-S", "Amutasa's Skinning Knife");

test_similarity("Q", "Quality");
test_similarity("q", "Quality");
test_similarity("a", "Quality");
test_similarity("al", "Quality");
test_similarity("at", "Quality");
test_similarity("aT", "Quality");
test_similarity("w", "Quality");
test_similarity("W", "Quality");
test_similarity("Quality", "Quality");
test_similarity("Quality", "Quality Word");
test_similarity("Quality", "Qualityword");
test_similarity("Quality", "Quality", true);
test_similarity("Quality", "Quality Word", true);
test_similarity("Quality", "Qualityword", true);
