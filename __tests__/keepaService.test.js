import axios from 'axios';
import { fetchPrice } from '../services/keepaService.js';

jest.mock('axios');

describe('keepaService.fetchPrice', () => {
  it('returns price object with asin and price', async () => {
    axios.get.mockResolvedValue({
      data: { products: [{ buyBoxPriceHistory: [null, 1234] }] },
    });
    const res = await fetchPrice('TEST_ASIN');
    expect(res).toEqual(
      expect.objectContaining({ asin: 'TEST_ASIN', price: 12 })
    );
  });
});
