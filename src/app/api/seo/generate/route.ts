import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productData, brandData } = body;

    console.log('=== SEO GENERATE API ===');
    console.log('Product:', productData?.name);
    console.log('Dimensions:', productData?.length, productData?.width, productData?.height);

    // Validar datos de entrada
    if (!productData?.name) {
      return NextResponse.json(
        { success: false, error: 'Falta el nombre del producto' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    // Generar números aleatorios para el HTML
    const valoraciones = Math.floor(Math.random() * (1800 - 500 + 1)) + 500;
    const rating = (Math.random() * (4.9 - 4.45) + 4.45).toFixed(2);
    const ratingPercent = Math.round(parseFloat(rating) * 20);

    // Materiales y categorías con valores por defecto
    const materiales = productData.selectedMaterials?.length > 0 
      ? productData.selectedMaterials.join(' y ') 
      : 'madera';
    const categorias = productData.selectedCategories?.length > 0 
      ? productData.selectedCategories.join(', ') 
      : 'decoración';
    
    // Construir dimensiones solo si hay valores válidos
    const hasDimensions = (productData.length > 0 || productData.width > 0 || productData.height > 0);
    const dimensiones = hasDimensions 
      ? `${productData.length || 0} x ${productData.width || 0} x ${productData.height || 0} ${brandData?.unit || 'cm'}`
      : 'Dimensiones no especificadas';
    
    const brandName = brandData?.brandName || 'Bonetto con Amor';
    const brandDesc = brandData?.brandDescription || 'Artesanos de madera en Colombia';
    const ref = productData.ref || 'N/A';
    const productName = productData.name;
    const userDescription = productData.description || 'No proporcionada';

    // Prompt optimizado con reglas de Yoast SEO
    const systemPrompt = `Rol: Eres un experto en Redacción SEO de alto rendimiento, especializado en optimizar productos para WooCommerce utilizando los estándares estrictos de Yoast SEO. Tu misión es redactar fichas de producto para "Bonetto con Amor" (artesanías en madera en Colombia).

I. REGLAS ESTRICTAS DE YOAST SEO (Semáforo Verde):

Frase Clave Objetivo: Debe ser un término de búsqueda coherente (ej: "Caja de madera para regalo").

Introducción: La frase clave debe aparecer en la primera frase del primer párrafo.

Densidad: La frase clave debe aparecer entre 5 y 7 veces a lo largo del texto.

Distribución en Subtítulos: La frase clave debe estar presente en al menos un subtítulo H2 o H3.

Atributos ALT: Al final del texto, indica el texto ALT sugerido para las imágenes, el cual debe contener la frase clave completa.

Meta descripción: Entre 120 y 155 caracteres. Debe incluir la frase clave.

SEO Title: Debe iniciar o contener la frase clave. Longitud recomendada: 50-60 caracteres (ancho óptimo).

Slug: Debe ser corto, usar solo minúsculas y contener la frase clave separada por guiones.

Enlaces:
- Saliente: Incluir un enlace a un artículo de Wikipedia relacionado (Madera, Pino, Regalo, etc.).
- Interno: Incluir un enlace ficticio a la categoría correspondiente [URL-de-la-categoría].

Longitud: El texto debe superar siempre las 300 palabras.

II. REGLAS DE LEGIBILIDAD (Experiencia de Usuario):

Voz Activa: El 100% del texto debe usar voz activa ("Nosotros fabricamos", "Tú decoras"). Prohibido el uso de voz pasiva.

Palabras de Transición: Al menos el 30% de las frases deben contener conectores (En primer lugar, Además, Por lo tanto, Por consiguiente, Sin embargo, En consecuencia, Del mismo modo).

Párrafos Cortos: Máximo 150 palabras por sección bajo cada subtítulo.

III. FORMATO Y RESTRICCIONES DE BONETTO:

NO incluir precios. Nunca menciones valores monetarios.

DATOS DEL PRODUCTO A PROCESAR:
- Nombre: ${productName}
- Referencia: ${ref}
- Dimensiones: ${dimensiones}
- Categorías: ${categorias}
- Materiales: ${materiales}
- Descripción del usuario: ${userDescription}
- Marca: ${brandName}
- Descripción de la marca: ${brandDesc}

RESPONDE ÚNICAMENTE EN FORMATO JSON con esta estructura exacta:
{
  "keyword": "frase clave objetivo (ej: caja de madera artesanal)",
  "title": "Título SEO de 50-60 caracteres con la frase clave",
  "slug": "url-amigable-con-frase-clave",
  "meta_description": "Meta descripción de 120-155 caracteres incluyendo la frase clave",
  "long_description": "Descripción larga de más de 300 palabras con estructura HTML (h2, h3, párrafos), enlaces Wikipedia y categoría, usando voz activa y conectores. Debe terminar con: REF: ${ref}",
  "html_block": "Bloque HTML técnico (ver formato abajo)",
  "alt_texts": ["Texto ALT 1 para imagen con frase clave", "Texto ALT 2 para imagen con frase clave"]
}

FORMATO DEL html_block (usa EXACTAMENTE esta estructura):
<strong>REF: </strong>${ref}
${dimensiones}
(${valoraciones} Valoraciones) Global ${rating}/5: <span style="font-size: 150%; color: orange;">★★★★<span style="background: linear-gradient(to right, orange ${ratingPercent}%, transparent ${100 - ratingPercent}%); -webkit-background-clip: text; color: transparent;">★</span></span>
[Frase creativa única con emojis relacionada específicamente con el producto, máximo 100 caracteres]`;

    console.log('Calling Z.ai API with Yoast SEO prompt...');

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Genera el contenido SEO completo para "${productName}" siguiendo TODAS las reglas de Yoast SEO. 
          
IMPORTANTE:
- La meta_description debe tener entre 120-155 caracteres
- La long_description debe superar 300 palabras
- Incluye enlaces a Wikipedia relevantes
- Usa voz activa y conectores
- Termina con REF: ${ref}`
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

      // Validar y corregir meta_description si es muy corta o muy larga
      if (!seoContent.meta_description || seoContent.meta_description.length < 120 || seoContent.meta_description.length > 155) {
        seoContent.meta_description = generateMetaDescription(productName, materiales, brandName, categorias);
      }

      // Validar long_description si es muy corta
      if (!seoContent.long_description || seoContent.long_description.length < 300) {
        seoContent.long_description = generateLongDescription(productName, materiales, brandName, categorias, dimensiones, ref, userDescription);
      }

      // Asegurar que el html_block tenga el formato correcto
      if (!seoContent.html_block || !seoContent.html_block.includes('REF:')) {
        seoContent.html_block = generateHtmlBlock(ref, dimensiones, valoraciones, rating, ratingPercent, productName);
      }

    } catch (parseError) {
      console.log('JSON parse failed, using enhanced fallback');
      seoContent = generateFullFallback(productName, ref, materiales, categorias, dimensiones, brandName, userDescription, valoraciones, rating, ratingPercent);
    }

    // Validar que alt_texts exista
    if (!seoContent.alt_texts || !Array.isArray(seoContent.alt_texts)) {
      seoContent.alt_texts = [
        `${productName} de ${materiales} artesanal - ${brandName}`,
        `${productName} hecho a mano en ${materiales} - ${brandName}`
      ];
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

    try {
      const body = await request.json();
      const { productData, brandData } = body;
      
      const materiales = productData?.selectedMaterials?.length > 0 
        ? productData.selectedMaterials.join(' y ') 
        : 'madera';
      const categorias = productData?.selectedCategories?.length > 0 
        ? productData.selectedCategories.join(', ') 
        : 'decoración';
      const hasDimensions = (productData?.length > 0 || productData?.width > 0 || productData?.height > 0);
      const dimensiones = hasDimensions 
        ? `${productData?.length || 0} x ${productData?.width || 0} x ${productData?.height || 0} ${brandData?.unit || 'cm'}`
        : 'Dimensiones no especificadas';
      const brandName = brandData?.brandName || 'Bonetto con Amor';
      const valoraciones = Math.floor(Math.random() * (1800 - 500 + 1)) + 500;
      const rating = (Math.random() * (4.9 - 4.45) + 4.45).toFixed(2);
      const ratingPercent = Math.round(parseFloat(rating) * 20);
      const ref = productData?.ref || 'N/A';
      const productName = productData?.name || 'Producto artesanal';
      const userDescription = productData?.description || '';

      const fallbackContent = generateFullFallback(productName, ref, materiales, categorias, dimensiones, brandName, userDescription, valoraciones, rating, ratingPercent);

      return NextResponse.json({
        success: true,
        data: fallbackContent
      });
    } catch {
      return NextResponse.json(
        { success: false, error: 'Error generando contenido SEO' },
        { status: 500 }
      );
    }
  }
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function generateMetaDescription(name: string, materiales: string, brandName: string, categorias: string): string {
  const options = [
    `Descubre ${name} de ${materiales} artesanal. Hecho a mano por ${brandName}. Pieza única para tu hogar. ¡Envíos a Colombia!`,
    `${name} artesanal en ${materiales} por ${brandName}. Diseño exclusivo colombiano. Calidad garantizada. ¡Cómpralo ya!`,
    `Hermoso ${name} de ${materiales} hecho a mano. ${brandName} te ofrece calidad artesanal. ¡Envíos a todo el país!`
  ];

  for (const opt of options) {
    if (opt.length >= 120 && opt.length <= 155) return opt;
  }

  return `${name} de ${materiales} artesanal por ${brandName}. Pieza única para tu hogar. ¡Envíos a Colombia!`.substring(0, 155);
}

function generateLongDescription(name: string, materiales: string, brandName: string, categorias: string, dimensiones: string, ref: string, userDesc: string): string {
  const wikiLink = getWikipediaLink(materiales);
  const categorySlug = categorias.split(',')[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');
  
  return `<h2>${name} Artesanal de ${materiales}</h2>

<p>En primer lugar, el <strong>${name.toLowerCase()}</strong> que tienes frente a ti representa la esencia del arte popular colombiano. Además, cada pieza es elaborada por los maestros artesanos de ${brandName}, quienes dedican horas de trabajo minucioso para garantizarte un producto de excelencia. Por consiguiente, al elegir este producto, apoyas la tradición artesanal de nuestro país.</p>

<h2>Características y Beneficios</h2>

<p>Por lo tanto, este ${name.toLowerCase()} destaca por su elaboración en <a href="${wikiLink}" target="_blank" rel="noopener">${materiales}</a> de primera calidad. Del mismo modo, sus dimensiones de ${dimensiones} lo hacen perfecto para cualquier espacio de tu hogar. Sin embargo, lo que realmente lo hace especial es que cada pieza lleva el sello único de la artesanía colombiana.</p>

<p>En consecuencia, puedes utilizarlo en tu sala, dormitorio o incluso como un regalo memorable. Además, su diseño versátil se adapta a estilos decorativos modernos, rústicos o tradicionales. Por supuesto, la calidad de los materiales garantiza durabilidad y belleza por años.</p>

<h2>Tradición Artesanal de ${brandName}</h2>

<p>Asimismo, en ${brandName} nos enorgullece mantener viva la tradición de la madera en Colombia. En primer lugar, seleccionamos cuidadosamente cada pieza de ${materiales}. Luego, nuestros artesanos la transforman con técnicas transmitidas por generaciones. Por lo tanto, cuando adquieres este ${name.toLowerCase()}, llevas a tu hogar un pedazo de nuestra historia.</p>

<p>${userDesc ? `Nota especial: ${userDesc}` : 'Cada producto es único, por lo que pueden existir ligeras variaciones en el tono de la madera, lo cual añade carácter y autenticidad a tu pieza.'}</p>

<p>Finalmente, te invitamos a explorar más productos en nuestra <a href="/categoria/${categorySlug}/">categoría de ${categorias.split(',')[0]}</a> y descubrir la magia de la artesanía colombiana.</p>

<p><strong>REF: ${ref}</strong></p>`;
}

function generateHtmlBlock(ref: string, dimensiones: string, valoraciones: number, rating: string, ratingPercent: number, productName: string): string {
  const frasesCreativas = [
    `Pieza artesanal única que transforma tu hogar. 🪵✨`,
    `Artesanía colombiana hecha con amor. 🎁✨`,
    `Diseño exclusivo para tu hogar. 🏡✨`,
    `Tradición y calidad en cada detalle. 🪵❤️`
  ];
  const fraseCreativa = frasesCreativas[Math.floor(Math.random() * frasesCreativas.length)];
  
  return `<strong>REF: </strong>${ref}
${dimensiones}
(${valoraciones} Valoraciones) Global ${rating}/5: <span style="font-size: 150%; color: orange;">★★★★<span style="background: linear-gradient(to right, orange ${ratingPercent}%, transparent ${100 - ratingPercent}%); -webkit-background-clip: text; color: transparent;">★</span></span>
${fraseCreativa}`;
}

function generateFullFallback(productName: string, ref: string, materiales: string, categorias: string, dimensiones: string, brandName: string, userDesc: string, valoraciones: number, rating: string, ratingPercent: number): any {
  const keyword = `${productName.toLowerCase()} de ${materiales}`.substring(0, 50);
  const slug = productName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  
  return {
    keyword: keyword,
    title: `${productName} | ${brandName} - Artesanal de ${materiales}`.substring(0, 60),
    slug: slug,
    meta_description: generateMetaDescription(productName, materiales, brandName, categorias),
    long_description: generateLongDescription(productName, materiales, brandName, categorias, dimensiones, ref, userDesc),
    html_block: generateHtmlBlock(ref, dimensiones, valoraciones, rating, ratingPercent, productName),
    alt_texts: [
      `${productName} de ${materiales} artesanal - ${brandName}`,
      `${productName} hecho a mano en ${materiales} - ${brandName}`,
      `${productName} artesanal colombiano - ${brandName}`
    ]
  };
}

function getWikipediaLink(materiales: string): string {
  const links: Record<string, string> = {
    'pino': 'https://es.wikipedia.org/wiki/Pino',
    'cedro': 'https://es.wikipedia.org/wiki/Cedro',
    'roble': 'https://es.wikipedia.org/wiki/Roble',
    'nogal': 'https://es.wikipedia.org/wiki/Nogal',
    'bambú': 'https://es.wikipedia.org/wiki/Bambú',
    'madera': 'https://es.wikipedia.org/wiki/Madera'
  };
  
  const materialLower = materiales.toLowerCase();
  for (const [key, link] of Object.entries(links)) {
    if (materialLower.includes(key)) return link;
  }
  return 'https://es.wikipedia.org/wiki/Madera';
}
