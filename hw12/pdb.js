/* atom {
  record, serial, atm, residue, chain, residue_sequence,
  x, y, z, occupancy, b, element, secondaryStructure,
  distance, select, toString, toObject
}
*/
export class Atom {
  constructor(args = {record, serial, atm, residue, chain, residue_sequence,
    x, y, z, occupancy, b, element}) {
    Object.assign(this, args); // I've impressed myself with my destructuring skills
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
    return `${this.name} ${this.element} ${this.residue} ${this.chain} ${this.coordinates}`;
  }

  toObject() {
    return {
      name: this.name,
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
    console.log(this.atoms);
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
    return this.#pdb;
  }

  #parseAtoms() {
    // get all the atoms from this.pdb
    // return an array of atom objects

    const atoms = [];
    const lines = this.#pdb.split("\n");

    for (const line of lines) {
      if (line.startsWith("ATOM") || line.startsWith("HETATM")) {
        const [ record, serial, atm, residue, chain, residue_sequence,
          x, y, z, occupancy, b, element ] = line.split(/\s+/);

        const atom = new Atom({
          record,
          serial: parseInt(serial),
          atm,
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
    return this.#pdb;
  }

  get atoms() {
    return this.#atoms;
  }

  residues() {
    const residues = this.atoms.reduce((residues, atom) => {
      const residue = residues.find((residue) => residue.name === atom.residue);
      if (residue) {
        residue.atoms.push(atom);
      } else {
        residues.push({
          name: atom.residue,
          atoms: [atom]
        });
      }
      return residues;
    }, []);

    return residues;
  }

  chains() {
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
    }, []);

    return chains;
  }

  centralAtoms() {
    return this.atoms.filter((atom) => atom.name === "CA");
  }

  coordinates() {
    return this.atoms.map((atom) => atom.coordinates);
  }

  distance(atom1, atom2) {
    // stuff
  }

  select(query) {
    // stuff
  }
}

export default { Atom, PDB };