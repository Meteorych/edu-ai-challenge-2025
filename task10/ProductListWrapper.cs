using System.Text.Json.Serialization;

namespace ProductSearch;

public class ProductListWrapper
{
    [JsonPropertyName("products")]
    public List<Product> Products { get; set; } = [];
}