import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productData, brandData } = body;

    console.log('=== SEO GENERATE API ===');
    console.log('Product:', productData?.name);
    console.log('Brand:', brandData?.brandName);

    // Validar datos de entrada
    if (!productData?.name) {
      return NextResponse.json(
        { success: false, error: 'Falta el nombre del producto' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    // Generar números aleatorios para el HTML
    const valoraciones = Math.floor(Math.random() * (2000 - 800 + 1)) + 800;
    const rating = (Math.random() * (4.9 - 4.4) + 4.4).toFixed(2);
    const ratingPercent = Math.round(parseFloat(rating) * 20);

    // Materiales y categorías con valores por defecto
    const materiales = productData.selectedMaterials?.length > 0 
      ? productData.selectedMaterials.join(' y ') 
      : 'madera';
    const categorias = productData.selectedCategories?.length > 0 
      ? productData.selectedCategories.join(', ') 
      : 'decoración';
    const dimensiones = `${productData.length || 0} x ${productData.width || 0} x ${productData.height || 0} ${brandData?.unit || 'cm'}`;
    const brandName = brandData?.brandName || 'Bonetto con Amor';
    const brandDesc = brandData?.brandDescription || 'Artesanos de madera en Colombia';

    // Prompt optimizado para generar contenido SEO de calidad
    const systemPrompt = `Eres un experto en SEO para e-commerce y WooCommerce. Genera contenido optimizado para Yoast SEO (semáforo verde).

REGLAS IMPORTANTES:
- Responde SOLO en formato JSON válido, sin texto adicional
- El JSON debe tener EXACTAMENTE estas claves: keyword, title, slug, meta_description, long_description, html_block
- NO incluyas precios
- Usa español neutro y profesional

INFORMACIÓN DE LA MARCA:
- Nombre: ${brandName}
- Descripción: ${brandDesc}

INFORMACIÓN DEL PRODUCTO:
- Nombre: ${productData.name}
- Referencia: ${productData.ref || 'N/A'}
- Dimensiones: ${dimensiones}
- Categorías: ${categorias}
- Materiales: ${materiales}
- Descripción del usuario: ${productData.description || 'No proporcionada'}

REQUISITOS ESPECÍFICOS:

1. keyword: La palabra clave principal (ej: "caja de madera artesanal")

2. title: Título SEO de 50-60 caracteres. Formato: "Nombre del Producto | Marca - Beneficio"
   Ejemplo: "Caja Baúl de Madera | Bonetto con Amor - Artesanal"

3. slug: URL amigable en minúsculas, sin acentos, con guiones
   Ejemplo: "caja-baul-madera-artesanal"

4. meta_description: DESCRIPCIÓN META DE 140-155 CARACTERES EXACTOS.
   Debe incluir: nombre del producto, material, beneficio principal y marca.
   Ejemplo: "Descubre nuestra caja baúl artesanal de madera pino. Diseño único hecho a mano por Bonetto con Amor. Perfecta para organizar con estilo. ¡Envíos a todo Colombia!"

5. long_description: DESCRIPCIÓN LARGA de 200-300 palabras.
   Estructura:
   - Párrafo 1: Introducción del producto con sus características principales
   - Párrafo 2: Beneficios y usos del producto
   - Párrafo 3: Detalles de materiales y craftsmanship
   - Párrafo 4: Información de la marca y cierre

6. html_block: Usa EXACTAMENTE este formato:
<strong>REF: </strong>${productData.ref || 'N/A'}
${dimensiones}
(${valoraciones} Valoraciones) Global ${rating}/5: <span style="font-size: 150%; color: orange;">★★★★<span style="background: linear-gradient(to right, orange ${ratingPercent}%, transparent ${100 - ratingPercent}%); -webkit-background-clip: text; color: transparent;">★</span></span>
[FRASE CREATIVA ESPECÍFICA DEL PRODUCTO con emojis apropiados, máximo 100 caracteres]`;

    console.log('Calling Z.ai API...');

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: 'Genera el contenido SEO completo en formato JSON. Recuerda: meta_description DEBE tener entre 140-155 caracteres.'
        }
      ],
      thinking: { type: 'disabled' }
    });

    const responseText = completion.choices[0]?.message?.content || '';
    console.log('Z.ai response received, length:', responseText.length);

    // Intentar parsear el JSON de la respuesta
    let seoContent;
    try {
      // Limpiar la respuesta de posibles caracteres extra
      const cleanResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      seoContent = JSON.parse(cleanResponse);
      console.log('JSON parsed successfully');

      // Validar y corregir meta_description si es muy corta
      if (!seoContent.meta_description || seoContent.meta_description.length < 140) {
        const metaBase = `${productData.name} artesanal de ${materiales}. Hecho a mano por ${brandName}. `;
        const metaExtra = seoContent.meta_description || '';
        seoContent.meta_description = (metaBase + metaExtra).substring(0, 155);
      }

      // Validar long_description si es muy corta
      if (!seoContent.long_description || seoContent.long_description.length < 150) {
        seoContent.long_description = generateFallbackLongDescription(productData, brandName, materiales, categorias, dimensiones);
      }

    } catch (parseError) {
      console.log('JSON parse failed, using enhanced fallback');
      seoContent = generateFallbackSEO(productData, brandName, materiales, categorias, dimensiones, valoraciones, rating, ratingPercent);
    }

    console.log('=== SEO CONTENT GENERATED ===');
    console.log('Meta description length:', seoContent.meta_description?.length);
    console.log('Long description length:', seoContent.long_description?.length);

    return NextResponse.json({
      success: true,
      data: seoContent
    });

  } catch (error) {
    console.error('=== ERROR IN SEO GENERATE ===');
    console.error('Error:', error);

    // Generar contenido de fallback completo en caso de error
    const { productData, brandData } = await request.json().catch(() => ({ productData: {}, brandData: {} }));
    const materiales = productData?.selectedMaterials?.length > 0 
      ? productData.selectedMaterials.join(' y ') 
      : 'madera';
    const categorias = productData?.selectedCategories?.length > 0 
      ? productData.selectedCategories.join(', ') 
      : 'decoración';
    const dimensiones = `${productData?.length || 0} x ${productData?.width || 0} x ${productData?.height || 0} ${brandData?.unit || 'cm'}`;
    const brandName = brandData?.brandName || 'Bonetto con Amor';
    const valoraciones = Math.floor(Math.random() * (2000 - 800 + 1)) + 800;
    const rating = (Math.random() * (4.9 - 4.4) + 4.4).toFixed(2);
    const ratingPercent = Math.round(parseFloat(rating) * 20);

    const fallbackContent = generateFallbackSEO(productData, brandName, materiales, categorias, dimensiones, valoraciones, rating, ratingPercent);

    return NextResponse.json({
      success: true,
      data: fallbackContent
    });
  }
}

// Función para generar fallback robusto
function generateFallbackSEO(productData: any, brandName: string, materiales: string, categorias: string, dimensiones: string, valoraciones: number, rating: string, ratingPercent: number) {
  const name = productData?.name || 'Producto artesanal';
  const ref = productData?.ref || 'N/A';

  return {
    keyword: `${name.toLowerCase()} ${materiales}`.trim(),
    title: `${name} | ${brandName} - Artesanal de ${materiales}`.substring(0, 60),
    slug: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    meta_description: generateMetaDescription(name, materiales, brandName),
    long_description: generateFallbackLongDescription(productData, brandName, materiales, categorias, dimensiones),
    html_block: `<strong>REF: </strong>${ref}
${dimensiones}
(${valoraciones} Valoraciones) Global ${rating}/5: <span style="font-size: 150%; color: orange;">★★★★<span style="background: linear-gradient(to right, orange ${ratingPercent}%, transparent ${100 - ratingPercent}%); -webkit-background-clip: text; color: transparent;">★</span></span>
Pieza artesanal única hecha con amor. 🪵✨`
  };
}

function generateMetaDescription(name: string, materiales: string, brandName: string): string {
  const options = [
    `Descubre ${name} artesanal de ${materiales}. Hecho a mano por ${brandName}. Diseño único que transforma tu hogar. ¡Envíos a Colombia!`,
    `${name} de ${materiales} hecho a mano por ${brandName}. Artesanía colombiana de calidad. Pieza única para tu hogar. ¡Cómpralo ahora!`,
    `Hermoso ${name} artesanal en ${materiales}. Diseño exclusivo de ${brandName}. Calidad artesanal colombiana. ¡Envíos a todo el país!`
  ];

  // Seleccionar la opción que tenga entre 140-155 caracteres
  for (const opt of options) {
    if (opt.length >= 140 && opt.length <= 155) return opt;
  }

  // Si ninguna funciona, ajustar la primera
  const base = `Descubre ${name} artesanal de ${materiales}. Hecho a mano por ${brandName}. `;
  if (base.length < 140) {
    return base + 'Diseño único para tu hogar. ¡Envíos a Colombia!';
  }
  return base.substring(0, 155);
}

function generateFallbackLongDescription(productData: any, brandName: string, materiales: string, categorias: string, dimensiones: string): string {
  const name = productData?.name || 'Producto artesanal';
  const userDesc = productData?.description || '';

  return `${name} es una pieza artesanal única creada con dedicación por los maestros artesanos de ${brandName}. Elaborada en ${materiales} de la más alta calidad, esta pieza refleja la tradición y el cuidado artesanal colombiano.

Cada ${name.toLowerCase()} es elaborado a mano, lo que garantiza que recibirás una pieza única con su propia personalidad y carácter. Los detalles en la madera, las líneas de diseño y el acabado impecable hacen de este producto una opción perfecta para quienes valoran la autenticidad y la calidad.

Ideal para ${categorias.toLowerCase()}, este producto no solo cumple una función práctica sino que también añade calidez y estilo a cualquier espacio. Su diseño versátil se adapta perfectamente a hogares modernos, rústicos o tradicionales.

Dimensiones: ${dimensiones}. Cada pieza puede presentar ligeras variaciones debido a su naturaleza artesanal, lo que la hace aún más especial.

${userDesc ? `Nota del artesano: ${userDesc}` : ''}

${brandName} - Artesanos de madera en Colombia, transformando la madera en obras de arte con amor desde hace generaciones.`;
}
