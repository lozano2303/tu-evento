package TuEvento.Backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity(name = "category")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer categoryID;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 100)
    private String description;

    @ManyToOne
    @JoinColumn(name = "dadID", referencedColumnName = "categoryID")
    private Category parentCategory;

    @OneToMany(mappedBy = "parentCategory", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Category> subCategories;

    public Category(Integer categoryID, String name, String description, Category parentCategory) {
        this.categoryID = categoryID;
        this.name = name;
        this.description = description;
        this.parentCategory = parentCategory;
    }
}