function commandBuilder({ dotCommand = 'dot', suppressWarnings = true, format = 'svg' } = {}) {
  const args = [
    ...(function* () {
      if (suppressWarnings) yield '-q';
      yield `-T${format}`;
    })(),
  ];
  return [dotCommand, args];
}

export async function toStream(dot, options) {
  const [command, args] = commandBuilder(options);
  const cp = new Deno.Command(command, {
    args: args,
    stdin: 'piped',
  }).spawn();
  const stdin = cp.stdin.getWriter();
  await stdin.write(new TextEncoder().encode(dot));
  await stdin.close();
  return cp.stdout;
}

export async function toFile(dot, filePath, options) {
  const output = await Deno.open(filePath, { write: true });
  const stream = await toStream(dot, options);
  await stream.pipeTo(output.writable);
}
