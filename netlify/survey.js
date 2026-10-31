exports.handler = async (event) => {

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({
        ok: false,
        error: "Método no permitido"
      })
    };
  }

  const scriptUrl = process.env.APPS_SCRIPT_URL;

  if (!scriptUrl) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: "Falta configurar Apps Script"
      })
    };
  }

  try {

    const data = JSON.parse(event.body || "{}");

    if (!data.id || !data.surveyor || !data.answers) {
      throw new Error("Datos incompletos");
    }

    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(data),
      redirect: "follow"
    });

    if (!response.ok) {
      throw new Error("Error de conexión con Apps Script");
    }

    const result = await response.json();

    if (!result.ok || result.id !== data.id) {
      throw new Error(result.error || "No se confirmó el registro");
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ok: true,
        id: result.id
      })
    };

  } catch (error) {

    return {
      statusCode: 502,
      body: JSON.stringify({
        ok: false,
        error: error.message
      })
    };

  }
};