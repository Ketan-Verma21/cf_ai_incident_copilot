export class ChatMemory {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    let message;
    try {
      // Try to parse JSON body
      const data = await request.json();
      message = data.message;
    } catch (e) {
      // If parsing fails, treat as plain text
      message = await request.text();
    }

    // Save message with timestamp as key
    await this.state.storage.put(Date.now(), message);

    // Retrieve all stored messages
    const history = [];
    await this.state.storage.list().then(entries => {
      for (const [_, value] of entries) {
        history.push(value);
      }
    });

    return new Response(JSON.stringify({ pastMessages: history }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}
