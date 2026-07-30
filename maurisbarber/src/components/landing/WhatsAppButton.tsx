import { whatsappHref } from "@/lib/whatsapp";

export function WhatsAppButton({ whatsappNumber }: { whatsappNumber: string }) {
  const href = whatsappHref(whatsappNumber, "Hola, quiero agendar una asesoría personalizada.");

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-floating transition-transform duration-200 hover:scale-105 active:scale-95"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-current">
        <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.362.687 4.564 1.874 6.417L4 29l7.771-1.845A11.94 11.94 0 0 0 16.001 27C22.629 27 28 21.627 28 15S22.629 3 16.001 3Zm0 21.75c-1.978 0-3.822-.58-5.373-1.578l-.386-.243-4.611 1.095 1.128-4.494-.253-.397A9.71 9.71 0 0 1 5.25 15c0-5.928 4.822-10.75 10.751-10.75S26.75 9.072 26.75 15 21.929 24.75 16.001 24.75Zm5.893-8.06c-.322-.161-1.906-.94-2.202-1.047-.295-.108-.51-.161-.725.161-.214.322-.832 1.047-1.02 1.262-.188.215-.376.242-.698.081-.322-.161-1.36-.501-2.591-1.598-.958-.854-1.605-1.909-1.793-2.231-.188-.322-.02-.496.141-.657.145-.144.322-.376.483-.564.161-.188.214-.322.322-.537.107-.215.054-.403-.027-.564-.081-.161-.725-1.747-.993-2.393-.262-.63-.528-.545-.725-.555-.188-.009-.403-.011-.618-.011-.215 0-.564.081-.859.403-.295.322-1.128 1.102-1.128 2.688 0 1.586 1.155 3.118 1.316 3.333.161.215 2.273 3.47 5.507 4.867.769.332 1.369.53 1.837.678.772.246 1.475.211 2.031.128.62-.093 1.906-.779 2.174-1.531.268-.752.268-1.396.188-1.531-.081-.134-.295-.215-.618-.376Z" />
      </svg>
    </a>
  );
}
