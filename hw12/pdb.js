/* atom {
  record, serial, name, residue, chain, residue_sequence,
  x, y, z, occupancy, b, element, code,
  distance, select, toString, toObject
}
*/
export class Atom {
  static AMNIO_ACID_SINGLE_LETTER_FROM_THREE_LETTER = {
    "ALA": "A",
    "ARG": "R",
    "ASN": "N",
    "ASP": "D",
    "CYS": "C",
    "GLN": "Q",
    "GLU": "E",
    "GLY": "G",
    "HIS": "H",
    "ILE": "I",
    "LEU": "L",
    "LYS": "K",
    "MET": "M",
    "PHE": "F",
    "PRO": "P",
    "SER": "S",
    "THR": "T",
    "TRP": "W",
    "TYR": "Y",
    "VAL": "V"
  }

  constructor(args = {record, serial, name, residue, chain, residue_sequence,
    x, y, z, occupancy, b, element}) {
    Object.assign(this, args); // I've impressed myself with my destructuring skills
    this.code = Atom.AMNIO_ACID_SINGLE_LETTER_FROM_THREE_LETTER[this.residue];
  }

  distance(atom) {
    const x = this.coordinates.x - atom.coordinates.x;
    const y = this.coordinates.y - atom.coordinates.y;
    const z = this.coordinates.z - atom.coordinates.z;
    return Math.sqrt(x * x + y * y + z * z);
  }

  // this is unnecessary currently, but I'm imagining a future
  // where you can highlight ranges
  select(query) {
    return query(this);
  }

  // for debugging purposes
  toString() {
    return `${this.name} ${this.code} ${this.element} ${this.residue} ${this.chain} ${this.coordinates}`;
  }

  // I should probably all the stuff -- I wonder if Object.assign({}, this) would just
  // have everything
  toObject() {
    return {
      name: this.name,
      code: this.code,
      element: this.element,
      residue: this.residue,
      chain: this.chain,
      coordinates: this.coordinates
    };
  }
}

export class PDB {
  #pdb
  #atoms

  constructor(pdb) {
    this.#pdb = pdb;
    this.#atoms = this.#parseAtoms();
  }

  static async fromFile(file) {
    const data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
    return new PDB(data);
  }
 
  toString() {
    // this will crash safari if the pdb is too big
    return this.pdb;
  }

  #parseAtoms() {
    // get all the atoms from this.pdb
    // return an array of atom objects

    const atoms = [];
    const lines = this.#pdb.split("\n");

    for (const line of lines) {
      if (line.startsWith("ATOM") || line.startsWith("HETATM")) {
        const [ record, serial, name, residue, chain, residue_sequence,
          x, y, z, occupancy, b, element ] = line.split(/\s+/);

        const atom = new Atom({
          record,
          serial: parseInt(serial),
          name,
          element,
          residue,
          chain,
          residue_sequence: parseInt(residue_sequence),
          coordinates: {
            x: parseFloat(x),
            y: parseFloat(y),
            z: parseFloat(z)
          },
          occupancy: parseFloat(occupancy),
          b: parseFloat(b)
        });
        atoms.push(atom);
      }
    }

    return atoms;
  }

  get pdb() {
    // this will crash the browser if the pdb is too big
    return `${this.#pdb}`;
  }

  get atoms() {
    return this.#atoms;
  }

  get residues() {
    return this.#residues();
  }
  
  get fasta() {
    return this.#fasta();
  }

  get fastas() {
    return this.#fastas();
  }

  get chains() {
    return this.#chains();
  }

  get backbones() {
    return this.#backbones();
  }

  get coordinates() {
    return this.#coordinates();
  }

  get chain_coordinates() {
    return this.#chain_coordinates();
  }

  get chain_backbone_coordinates() {
    const coords = this.#chain_backbone_coordinates();
    return this.normalizeCoordinates(coords);
  }

  #residues(chain = this.atoms) {
    const residues = chain.reduce((residues, atom) => {
      const residue = residues.find((residue) => residue.sequence === atom.residue_sequence);
      if (residue) {
        residue.atoms.push(atom);
      } else {
        residues.push({
          name: atom.residue,
          code: atom.code,
          sequence: atom.residue_sequence,
          atoms: [atom]
        });
      }
      return residues;
    }, []);

    return residues;
  }

  #fasta() {
    return this.residues.map((residue) => residue.code).join("");
  }

  #fastas() {
    return this.chains.map((chain) => {
      return {
        name: chain.name,
        sequence: chain.residues.map((residue) => residue.code).join("")
      };
    });
  }

  #chains() {
    const chains = this.atoms.reduce((chains, atom) => {
      const chain = chains.find((chain) => chain.name === atom.chain);
      if (chain) {
        chain.atoms.push(atom);
      } else {
        chains.push({
          name: atom.chain,
          atoms: [atom]
        });
      }
      return chains;
    }, []).map((chain) => {
      const residues = this.#residues(chain.atoms);
      return {
        name: chain.name,
        residues
      };
    });

    return chains;
  }

  #backbones() {
    return this.chains.map((chain) => {
        return {
            name: chain.name,
            // Filter out any undefined atoms and only keep valid CA atoms
            atoms: chain.residues
                .map((residue) => {
                    const caAtom = residue.atoms.filter((atom) => atom.name === "CA")[0];
                    return caAtom;  // Return undefined if no CA atom found
                })
                .filter(atom => atom !== undefined)  // Remove any undefined atoms
        };
    });
  }

  #coordinates(atoms = this.atoms) {
    // Filter out any atoms that don't have valid coordinates -- this is if you get it from
    // rcsb ...  if you fold a sequence on alphafold server, it will always have coordinates
    return atoms
        .filter(atom => atom && atom.coordinates && 
                typeof atom.coordinates.x === 'number' &&
                typeof atom.coordinates.y === 'number' &&
                typeof atom.coordinates.z === 'number')
        .map((atom) => atom.coordinates);
  }

  #chain_coordinates() {
    return this.chains.map((chain) => {
      return {
        name: chain.name,
        coordinates: chain.residues.map((residue) => this.#coordinates(residue.atoms)).flat()
      };
    });
  }

  // I probably went overboard w/ getters for private computed values ... but it
  // feels cleaner!
  #chain_backbone_coordinates() {
    return this.backbones
        .filter(backbone => backbone.atoms.length > 0)  // Only include chains with atoms
        .map((backbone) => {
            return {
                name: backbone.name,
                coordinates: this.#coordinates(backbone.atoms)
            };
        })
        .filter(chain => chain.coordinates.length > 0);  // Only include chains with coordinates
  }

  // this is a bit hacky cause I had to clobber it together towards the end
  // basically the range of coordinates for structure files is way larger than
  // the webGL domain.  So we have to normalize the distances to somethign reasonable
  // for it to show up at all with reasonable zoom values.
  normalizeCoordinates(data) {
    // Helper function to find max absolute value recursively
    const findMaxAbs = (item) => {
        if (Array.isArray(item)) {
            return Math.max(...item.map(findMaxAbs));
        }
        // need a conditions to deal with atoms that don't have coordinates
        if (item && typeof item === 'object') {
            if ('x' in item && 'y' in item && 'z' in item) {
                return Math.max(Math.abs(item.x), Math.abs(item.y), Math.abs(item.z));
            }
            return Math.max(...Object.values(item).map(findMaxAbs));
        }
        return 0;
    };

    // Helper function to normalize coordinates recursively
    // if you're using chains vs you have a nested structure
    const normalize = (item, maxAbs) => {
        if (Array.isArray(item)) {
            return item.map(i => normalize(i, maxAbs));
        }
        if (item && typeof item === 'object') {
            if ('x' in item && 'y' in item && 'z' in item) {
                return {
                    ...item,
                    x: item.x / maxAbs,
                    y: item.y / maxAbs,
                    z: item.z / maxAbs
                };
            }
            const result = {};
            for (const [key, value] of Object.entries(item)) {
                result[key] = normalize(value, maxAbs);
            }
            return result;
        }
        return item;
    };

    const maxAbs = findMaxAbs(data);
    return normalize(data, maxAbs);
  }

  distance(atom1, atom2) {
    // placeholder case I ever want to make jsMol :)
  }

  select(query) {
    // stuff -- functions on Atom.query -- have to think about implementation
  }
}

export default { Atom, PDB };