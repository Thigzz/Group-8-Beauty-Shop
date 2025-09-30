import reducer, {
  setItems,
  selectProduct,
  clearSelectedProduct,
  clearProducts,
  clearSearchResults,
  clearError,
  fetchAllProducts
} from '../../../../src/redux/features/products/productsSlice';
import apiClient from '../../../../src/api/axios';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

jest.mock('../../../../client/src/api/axios');


const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('productsSlice', () => {
  const initialState = {
    items: [],
    selected: null,
    loading: false,
    error: null,
    currentFilter: null,
    searchResults: [],
    searchLoading: false,
    searchError: null,
    pagination: { total: 0, pages: 0, currentPage: 1 },
    lastFetched: null,
    cacheCleared: false
  };

  test('should handle initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  test('should handle setItems', () => {
    const action = setItems([{ id: 1, name: 'Lipstick' }]);
    const state = reducer(initialState, action);
    expect(state.items).toHaveLength(1);
    expect(state.items[0].name).toBe('Lipstick');
  });

  test('should handle selectProduct and clearSelectedProduct', () => {
    const product = { id: 1, name: 'Lipstick' };
    let state = reducer(initialState, selectProduct(product));
    expect(state.selected).toEqual(product);

    state = reducer(state, clearSelectedProduct());
    expect(state.selected).toBeNull();
  });

  test('should handle clearProducts', () => {
    const stateWithItems = { ...initialState, items: [{ id: 1 }] };
    const state = reducer(stateWithItems, clearProducts());
    expect(state.items).toHaveLength(0);
    expect(state.pagination.currentPage).toBe(1);
  });

  test('fetchAllProducts thunk success', async () => {
    const store = mockStore({ products: initialState });
    const mockData = { products: [{ id: 1, name: 'Lipstick' }], total: 1, pages: 1, current_page: 1 };
    apiClient.get.mockResolvedValue({ data: mockData });

    await store.dispatch(fetchAllProducts({ page: 1 }));
    const actions = store.getActions();

    expect(actions[0].type).toBe(fetchAllProducts.pending.type);
    expect(actions[1].type).toBe(fetchAllProducts.fulfilled.type);
    expect(actions[1].payload).toEqual(mockData);
  });

  test('fetchAllProducts thunk failure', async () => {
    const store = mockStore({ products: initialState });
    apiClient.get.mockRejectedValue({ response: { data: { message: 'Error fetching' } } });

    await store.dispatch(fetchAllProducts({ page: 1 }));
    const actions = store.getActions();

    expect(actions[0].type).toBe(fetchAllProducts.pending.type);
    expect(actions[1].type).toBe(fetchAllProducts.rejected.type);
    expect(actions[1].payload).toBe('Error fetching');
  });
});
