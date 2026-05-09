import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const newOverviews = {
  "Interstellar": "When Earth's crops begin to fail and humanity faces extinction, a daring team of astronauts must journey through a mysterious wormhole near Saturn. Leaving their families behind, they navigate mind-bending relativity and uncharted galaxies to find a new home for the human race before time runs out.",
  "Everything Everywhere All at Once": "An exhausted Chinese immigrant laundromat owner is suddenly thrust into an insane, multiverse-spanning adventure. She must channel the skills of her alternate selves to stop a bizarre, chaotic entity from destroying every universe—while also trying to finish her taxes and repair her fractured family.",
  "Dark": "When two children go missing in a small German town, it shatters the lives of four interconnected families. As they frantically search for the truth, they uncover a massive, mind-bending conspiracy involving time travel, dark secrets, and a sinister cycle that spans three generations.",
  "Attack on Titan": "For over a century, humanity has huddled behind massive walls to protect themselves from towering, flesh-eating giants. But when a colossal Titan breaches the outer defenses, a young boy vows to exterminate them all—unaware that the terrifying truth of his world will completely change the course of history.",
  "Your Name": "Two complete strangers—a city boy in Tokyo and a country girl in a rural town—inexplicably begin swapping bodies in their dreams. As they leave notes for each other and slowly fall in love, they desperately try to meet in person, only to discover a tragic twist of fate that might keep them apart forever.",
  "The Bear": "A brilliant, classically trained fine-dining chef is forced to return to his gritty Chicago roots to take over his family's chaotic sandwich shop after a heartbreaking tragedy. Amidst screaming matches, financial ruin, and kitchen disasters, he tries to transform the stubborn staff into a Michelin-level crew.",
  "Spider-Man: Into the Spider-Verse": "Brooklyn teenager Miles Morales is bitten by a radioactive spider and quickly discovers he's not the only web-slinger in town. When a particle accelerator tears open a portal to alternate dimensions, he must team up with a wildly diverse group of Spider-heroes to save Brooklyn from the villainous Kingpin.",
  "Mad Max: Fury Road": "In a scorched, post-apocalyptic wasteland where water and gas are worth more than life, a rebellious imperator stages a breathtaking escape to save a warlord's enslaved wives. With a haunted drifter named Max chained to their cause, they embark on a relentlessly explosive, high-octane chase across the deadly desert.",
  "Ted Lasso": "An aggressively upbeat American football coach is surprisingly hired to manage a struggling English Premier League soccer team—despite knowing absolutely nothing about the sport. What starts as a cynical scheme by the club's owner soon turns into a heartwarming revolution of optimism, biscuits, and sheer belief.",
  "A Silent Voice": "Years after ruthlessly bullying a deaf girl in elementary school, a teenager is consumed by intense guilt and isolation. On the verge of giving up on his life entirely, he tracks her down to make amends, setting them both on a deeply emotional, painful, and beautiful journey toward forgiveness and healing.",
  "Arrival": "When twelve mysterious extraterrestrial spacecraft touch down across the globe, humanity is paralyzed by fear. An elite linguistics professor is recruited by the military to crack their incredibly complex language and decipher their true intentions before paranoid world leaders trigger a devastating global war.",
  "Parasite": "A desperately poor but fiercely cunning family slowly and methodically cons their way into the lives of a wealthy, gullible household by posing as highly qualified professionals. But just as they start enjoying their luxurious new lifestyle, a shocking discovery in the basement completely derails their brilliant scam.",
  "Severance": "Employees at a massive, sterile corporation agree to have their memories surgically divided between their work lives and their personal lives. But when a mysterious former colleague appears outside the office, the 'innies' trapped inside slowly realize they are prisoners in a deeply terrifying and sinister conspiracy.",
  "Stranger Things": "When a young boy mysteriously vanishes into thin air in the quiet town of Hawkins, his desperate friends and family launch a frantic search. They soon stumble upon a secret government lab, terrifying supernatural forces, and a strange, telekinetic girl who might be their only hope against the terrifying Upside Down.",
  "Jujutsu Kaisen": "A kind-hearted high school student impulsively swallows the rotting, cursed finger of an ancient, terrifying demon to save his friends. Now sharing his body with the king of curses, he is thrust into a brutal, dark, and visually stunning secret world of sorcerers who fight deadly spirits born from human negativity."
};

async function rewrite() {
  const seedPath = path.join(__dirname, 'src', 'data', 'seedContent.js');
  const { seedContent } = await import('./src/data/seedContent.js');
  
  const updatedContent = seedContent.map(item => {
    if (newOverviews[item.title]) {
      return { ...item, overview: newOverviews[item.title] };
    }
    return item;
  });
  
  const fileContent = `export const seedContent = ${JSON.stringify(updatedContent, null, 2)};\n`;
  await fs.writeFile(seedPath, fileContent, 'utf-8');
  console.log(`Successfully rewrote overviews in seedContent.js.`);
}

rewrite().catch(console.error);
