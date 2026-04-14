import { View, Text, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://80.65.211.200:5000/api'; // Adjust for your backend URL

export default function ShopScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`);
      setProducts(response.data.products);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 20, padding: 10, borderWidth: 1, borderColor: '#ccc' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.name}</Text>
            <Text style={{ fontSize: 16, color: '#666' }}>{item.description}</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>R {item.price}</Text>
            <Text style={{ fontSize: 14, color: '#888' }}>{item.stock_quantity} in stock</Text>
          </View>
        )}
      />
    </View>
  );
}