/* ==========================================================
   TOUT SE RÈGLE ICI, EN HAUT DE CE FICHIER
   (ne touchez pas à la partie "NE PAS MODIFIER" plus bas)
   ========================================================== */

const TITRE = "Exposition permanente";

const DOSSIER_MURS   = "murs/";     // dossier des photos de murs
const DOSSIER_PHOTOS = "photos/";   // dossier des photos de l'expo
const EXTENSION      = ".webp";   // format de TOUTES les images (murs et photos)

/* Les PARTIES : chaque partie = des photos nommées  prefixe (1).webp, prefixe (2).webp ...
   - prefixe : début du nom de fichier
   - nombre  : combien de photos (numérotées de 1 à nombre)
   - fichiers (optionnel) : liste de noms exacts, si vos noms ne suivent pas ce modèle */
const PARTIES = {
  foyer:     { prefixe: "foyer",     nombre: 22 },
  etude:     { prefixe: "etude",     nombre: 22 },
  cafeteria: { prefixe: "cafeteria", nombre: 5  }
};

/* Les MURS : fichier (sans extension, dans DOSSIER_MURS), nom affiché, parties dont il propose les photos */
const TOUTES = ["foyer", "etude", "cafeteria"];
const MURS = [
  { fichier: "MUR_1",  nom: "Mur 1",  parties: TOUTES },
  { fichier: "MUR_2",  nom: "Mur 2",  parties: TOUTES },
  { fichier: "MUR_3",  nom: "Mur 3",  parties: TOUTES },
  { fichier: "MUR_4",  nom: "Mur 4",  parties: TOUTES },
  { fichier: "MUR_5",  nom: "Mur 5",  parties: TOUTES },
  { fichier: "MUR_6",  nom: "Mur 6",  parties: TOUTES },
  { fichier: "MUR_7",  nom: "Mur 7",  parties: TOUTES },
  { fichier: "MUR_8",  nom: "Mur 8",  parties: TOUTES },
  { fichier: "MUR_9",  nom: "Mur 9",  parties: TOUTES },
  { fichier: "MUR_10", nom: "Mur 10", parties: TOUTES },
  { fichier: "MUR_11", nom: "Mur 11", parties: TOUTES }
];

/* Exemple pour limiter un mur à une partie et le renommer :
   { fichier: "MUR_3", nom: "Couloir du foyer", parties: ["foyer"] }            */

/* ==========================================================
   NE PAS MODIFIER A PARTIR D'ICI
   ========================================================== */
function nomsPartie(p) {
  if (p.fichiers) return p.fichiers;
  var a = [];
  for (var i = 1; i <= p.nombre; i++) a.push(p.prefixe + " (" + i + ")" + EXTENSION);
  return a;
}
const EXPO = {
  version: 1,
  titre: TITRE,
  murs: MURS.map(function (m) {
    var photos = [];
    m.parties.forEach(function (cle) {
      nomsPartie(PARTIES[cle]).forEach(function (f) {
        photos.push({ fichier: DOSSIER_PHOTOS + f, titre: f.replace(/\.[^.]+$/, ""), legende: "" });
      });
    });
    return { id: m.fichier, nom: m.nom, image: DOSSIER_MURS + m.fichier + EXTENSION, photos: photos };
  })
};
