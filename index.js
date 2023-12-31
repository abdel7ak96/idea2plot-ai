import { process } from './env';
import { Configuration, OpenAIApi } from 'openai';

const setupInputContainer = document.getElementById('setup-input-container');
const movieBossText = document.getElementById('movie-boss-text');

const configuration = new Configuration({
  apiKey: process.env.OPEN_API_KEY,
});

const openai = new OpenAIApi(configuration);

document.getElementById('send-btn').addEventListener('click', () => {
  const setupTextarea = document.getElementById('setup-textarea');
  if (setupTextarea.value) {
    setupInputContainer.innerHTML = `<img src="images/loading.svg" class="loading" id="loading">`;
    movieBossText.innerText = `Ok, just wait a second while my digital brain digests that...`;
    fetchBotReply(setupTextarea.value);
    fetchSynopsis(setupTextarea.value);
  }
});

async function fetchBotReply(outline) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `
    Generate a short message to enthusiastically say "${outline}" sounds interesting and
    that you need some minutes to think about it. Mention one aspect of the sentence.
    ###
    outline: Two dogs fall in love and move to Hawaii to learn to surf.
    message: I'll need to think about that. But your idea is amazing! I love the bit about Hawaii!
    ###
    outline: A plane crashes in the jungle and the passengers have to walk 1000km to safety.
    message: I'll spend a few moments considering that. But I love your idea!! A disaster movie in
    the jungle!
    ###
    outline: A group of corrupt lawyers try to send an innocent woman to jail.
    message: Wow that is awesome! Corrupt lawyers, huh? Give me a few moments to think!
    ###
    outline: ${outline}
    message:
    `,
    max_tokens: 60,
  });
  movieBossText.innerText = response.data.choices[0].text.trim();
}

async function fetchSynopsis(outline) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Generate an engaging, professional and marketable movie synopsis for a movie based on the following an outline. The synopsis
    should include actors names in parentheses after each character. Choose actors that would be ideal for this role
    ###
    outline: A big-headed daredevil fighter pilot goes back to school only to be sent on a deadly mission.
    synopsis: The Top Gun Naval Fighter Weapons School is where the best of the best train to refine their elite
    flying skills. When hotshot fighter pilot Maverick (Tom Cruise) is sent to the school, his reckless
    attitude and cocky demeanor put him at odds with the other pilots, especially the cool and
    collected Iceman (Val Kilmer). But Maverick isn't only competing to be the top fighter pilot, he's
    also fighting for the attention of his beautiful flight instructor, Charlotte Blackwood (Kelly
    McGillis). Maverick gradually earns the respect of his instructors and peers and also the love of
    Charlotte, but struggles to balance his personal and professional life. As the pilots prepare for a
    mission against a foreign enemy, Maverick must confront his own demons and overcome the tragedies
    rooted deep in his past to become the best fighter pilot and return from the mission triumphant.

    ###
    outline: ${outline}
    synopsis:
    `,
    max_tokens: 700,
  });
  const synopsis = response.data.choices[0].text.trim();
  document.getElementById('output-text').innerText = synopsis;
  fetchTitle(synopsis);

  document.getElementById('output-stars').innerText =
    extractSubstringsBetweenParentheses(synopsis);
}

async function fetchTitle(synopsis) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `
      Generate a catchy movie title for this synopsis: ${synopsis}
    `,
    max_tokens: 25,
    temperature: 0.7,
  });

  document.getElementById('output-title').innerText =
    response.data.choices[0].text.trim();
}

function extractSubstringsBetweenParentheses(inputString) {
  let result = '';
  let substringStartIndex = 0;
  const stack = [];

  for (let i = 0; i < inputString.length; i++) {
    if (inputString[i] === '(') {
      if (stack.length === 0) substringStartIndex = i + 1;
      stack.push(i);
    } else if (inputString[i] === ')') {
      if (stack.length === 1) {
        if (result.length > 0) result += ', ';
        result += inputString.slice(substringStartIndex, i);
      }
      stack.pop();
    }
  }

  return result;
}
