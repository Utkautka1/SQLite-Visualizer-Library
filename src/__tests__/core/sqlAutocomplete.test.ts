import { SQLAutocomplete } from '../../core/sqlAutocomplete';
import { DatabaseSchema } from '../../types';

describe('SQLAutocomplete', () => {
  let autocomplete: SQLAutocomplete;

  beforeEach(() => {
    autocomplete = new SQLAutocomplete();
  });

  describe('updateSchema', () => {
    it('should update schema', () => {
      const schema: DatabaseSchema = {
        tables: [
          {
            name: 'users',
            sql: 'CREATE TABLE users...',
            columns: [
              { name: 'id', type: 'INTEGER', notnull: true, dflt_value: null, pk: true },
              { name: 'name', type: 'TEXT', notnull: false, dflt_value: null, pk: false },
            ],
            indexes: [],
            foreignKeys: [],
          },
        ],
        version: '1.0.0',
      };

      autocomplete.updateSchema(schema);
      // Schema is updated internally, test through getSuggestions
      const suggestions = autocomplete.getSuggestions('SELECT * FROM ', 15);
      expect(suggestions.some((s) => s.label === 'users' && s.type === 'table')).toBe(true);
    });
  });

  describe('getSuggestions', () => {
    it('should suggest keywords', () => {
      const suggestions = autocomplete.getSuggestions('SEL', 3);
      expect(suggestions.some((s) => s.label === 'SELECT' && s.type === 'keyword')).toBe(true);
    });

    it('should suggest tables after FROM', () => {
      const schema: DatabaseSchema = {
        tables: [
          {
            name: 'users',
            sql: 'CREATE TABLE users...',
            columns: [],
            indexes: [],
            foreignKeys: [],
          },
        ],
        version: '1.0.0',
      };
      autocomplete.updateSchema(schema);

      const suggestions = autocomplete.getSuggestions('SELECT * FROM ', 15);
      expect(suggestions.some((s) => s.label === 'users' && s.type === 'table')).toBe(true);
    });
  });
});

