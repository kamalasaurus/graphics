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

  select(query) {
    return query(this);
  }

  toString() {
    return `${this.name} ${this.code} ${this.element} ${this.residue} ${this.chain} ${this.coordinates}`;
  }

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
    window.tmp = this;
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
    return this.#chain_backbone_coordinates();
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
        atoms: chain.residues.map((residue) => {
          return residue.atoms.filter((atom) => atom.name === "CA").pop();
        })
      };
    });
  }

  #coordinates(atoms = this.atoms) {
    return atoms.map((atom) => atom.coordinates);
  }

  #chain_coordinates() {
    return this.chains.map((chain) => {
      return {
        name: chain.name,
        coordinates: chain.residues.map((residue) => this.#coordinates(residue.atoms)).flat()
      };
    });
  }

  #chain_backbone_coordinates() {
    return this.backbones.map((backbone) => {
      return {
        name: backbone.name,
        coordinates: this.#coordinates(backbone.atoms)
      };
    });
  }

  distance(atom1, atom2) {
    // stuff
  }

  select(query) {
    // stuff
  }
}

export default { Atom, PDB };