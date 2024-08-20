import { useEffect, useState } from "react"
import "./output.css"

export default function App() {
  // Estado para armazenar o endereço IP fornecido pelo usuário
  const [ip, setIp] = useState("")
  // Estado para armazenar a quantidade de subredes
  const [subnets, setSubnets] = useState(1)
  // Estado para armazenar o valor CIDR (máscara de sub-rede) selecionado
  const [cidr, setCidr] = useState(24)
  // Estado para armazenar o resultado do cálculo de rede
  const [result, setResult] = useState({})

  // Efeito que calcula as informações de rede quando o IP, CIDR ou número de subredes muda
  useEffect(() => {
    if (ip) {
      calculateNetwork(ip, cidr, subnets)
    }
  }, [ip, cidr, subnets])

  // Função para calcular as informações de rede com base no IP, CIDR e número de subredes
  const calculateNetwork = (ip, cidr, subnets) => {
    const subnetMask = cidrToSubnet(cidr)
    const ipParts = ip.split(".").map(Number)
    const subnetParts = subnetMask.split(".").map(Number)

    // Calcula o endereço de rede
    const networkAddress = ipParts
      .map((part, index) => part & subnetParts[index])
      .join(".")

    // Calcula o endereço de broadcast
    const broadcastAddress = ipParts
      .map(
        (part, index) =>
          (part & subnetParts[index]) | (~subnetParts[index] & 255)
      )
      .join(".")

    // Calcula o primeiro e o último host
    const firstHost = incrementIp(networkAddress)
    const lastHost = decrementIp(broadcastAddress)

    // Determina a classe do IP
    const ipClass = determineIpClass(ipParts[0])
    // Calcula a quantidade de hosts
    const numHosts = Math.pow(2, 32 - cidr) - 2
    // Converte o IP para binário
    const ipBinary = convertToBinary(ipParts)
    // Calcula as informações das subredes
    const subnetsInfo = calculateSubnets(networkAddress, cidr, subnets)

    // Atualiza o estado com os resultados calculados
    setResult({
      networkAddress,
      broadcastAddress,
      firstHost,
      lastHost,
      ipClass,
      subnetMask,
      numHosts,
      ipBinary,
      subnetsInfo,
    })
  }

  // Função para calcular as subredes com base no endereço de rede, CIDR e número de subredes
  const calculateSubnets = (networkAddress, cidr, subnets) => {
    const subnetsInfo = []
    const increment = Math.pow(2, 32 - (cidr + Math.ceil(Math.log2(subnets))))
    let currentNetworkAddress = ipToDecimal(networkAddress)

    for (let i = 0; i < subnets; i++) {
      const subnetNetworkAddress = decimalToIp(currentNetworkAddress)
      const subnetBroadcastAddress = decimalToIp(
        currentNetworkAddress + increment - 1
      )
      const subnetFirstHost = incrementIp(subnetNetworkAddress)
      const subnetLastHost = decrementIp(subnetBroadcastAddress)

      subnetsInfo.push({
        subnetNetworkAddress,
        subnetBroadcastAddress,
        subnetFirstHost,
        subnetLastHost,
      })

      currentNetworkAddress += increment
    }

    return subnetsInfo
  }

  // Função para converter CIDR em máscara de sub-rede
  const cidrToSubnet = (cidr) => {
    const mask = []
    for (let i = 0; i < 4; i++) {
      const bits = Math.min(8, cidr)
      mask.push((256 - Math.pow(2, 8 - bits)) % 256)
      cidr -= bits
    }
    return mask.join(".")
  }

  // Função para determinar a classe do IP com base no primeiro octeto
  const determineIpClass = (firstOctet) => {
    if (firstOctet >= 1 && firstOctet <= 126) {
      return "Classe A"
    } else if (firstOctet >= 128 && firstOctet <= 191) {
      return "Classe B"
    } else if (firstOctet >= 192 && firstOctet <= 223) {
      return "Classe C"
    } else if (firstOctet >= 224 && firstOctet <= 239) {
      return "Classe D"
    } else if (firstOctet >= 240 && firstOctet <= 255) {
      return "Classe E"
    }
    return "Desconhecida"
  }

  // Função para converter o IP em binário
  const convertToBinary = (ipParts) => {
    return ipParts.map((part) => part.toString(2).padStart(8, "0")).join(".")
  }

  // Função para converter o IP em decimal
  const ipToDecimal = (ip) => {
    return ip
      .split(".")
      .reduce(
        (decimal, octet, index) => decimal + octet * Math.pow(256, 3 - index),
        0
      )
  }

  // Função para converter decimal em IP
  const decimalToIp = (decimal) => {
    return Array.from(
      { length: 4 },
      (_, i) => Math.floor(decimal / Math.pow(256, 3 - i)) % 256
    ).join(".")
  }

  // Função para incrementar o IP (para o próximo endereço)
  const incrementIp = (ip) => {
    const decimal = ipToDecimal(ip)
    return decimalToIp(decimal + 1)
  }

  // Função para decrementar o IP (para o endereço anterior)
  const decrementIp = (ip) => {
    const decimal = ipToDecimal(ip)
    return decimalToIp(decimal - 1)
  }

  return (
    <div className="grid place-items-center min-h-screen p-4">
      <div className="w-full sm:w-1/2 max-w-sm border-solid border-2 border-sky-500 p-3 rounded-xl">
        <div className="mb-4">
          <label className="text-center text-3xl block text-white familjen-grotesk-700 font-bold mb-2">
            Calculadora de IP
          </label>
          <input
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            className="text-center familjen-grotesk-400 shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:ring-4 focus:ring-sky-500 focus:outline-none focus:shadow-outline hover:border-blue-600 transition-all duration-300 bg-[#242424] text-[#ffffffde] caret-sky-500"
            placeholder="Endereço IP (exemplo 192.168.0.103)"
            aria-label="endereco"
          />
        </div>
        <div className="mb-4">
          <label className="text-white familjen-grotesk-400">CIDR:</label>
          <select
            value={cidr}
            onChange={(e) => setCidr(Number(e.target.value))}
            className="w-full py-2 px-3 bg-[#242424] text-white border rounded focus:ring-4 focus:ring-sky-500 focus:outline-none transition-all duration-300 hover:border-blue-600"
          >
            {Array.from({ length: 30 - 1 + 1 }, (_, i) => i + 1).map((cidr) => (
              <option key={cidr} value={cidr}>
                /{cidr}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="text-white familjen-grotesk-400">
            Quantidade de subredes:
          </label>
          <select
            value={subnets}
            onChange={(e) => setSubnets(Number(e.target.value))}
            className="w-full py-2 px-3 bg-[#242424] text-white border rounded focus:ring-4 focus:ring-sky-500 focus:outline-none transition-all duration-300 hover:border-blue-600"
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={4}>4</option>
            <option value={8}>8</option>
            <option value={16}>16</option>
            <option value={32}>32</option>
            <option value={64}>64</option>
            <option value={128}>128</option>
            <option value={256}>256</option>
          </select>
        </div>
        <hr className="mb-2" />
        <div>
          <div className="flex flex-row items-center justify-between">
            <p className="text-white familjen-grotesk-400">Classe do IP:</p>
            <p className="text-white familjen-grotesk-400">
              {result.ipClass || "-"}
            </p>
          </div>
          <div className="flex flex-row items-center justify-between">
            <p className="text-white familjen-grotesk-400">
              Máscara de sub-rede:
            </p>
            <p className="text-white familjen-grotesk-400">
              {result.subnetMask || "-"}
            </p>
          </div>
          <div className="flex flex-row items-center justify-between">
            <p className="text-white familjen-grotesk-400">Endereço de rede:</p>
            <p className="text-white familjen-grotesk-400">
              {result.networkAddress || "-"}
            </p>
          </div>
          <div className="flex flex-row items-center justify-between">
            <p className="text-white familjen-grotesk-400">
              Endereço Broadcast:
            </p>
            <p className="text-white familjen-grotesk-400">
              {result.broadcastAddress || "-"}
            </p>
          </div>
          <div className="flex flex-row items-center justify-between">
            <p className="text-white familjen-grotesk-400">Primeiro Host:</p>
            <p className="text-white familjen-grotesk-400">
              {result.firstHost || "-"}
            </p>
          </div>
          <div className="flex flex-row items-center justify-between">
            <p className="text-white familjen-grotesk-400">Último Host:</p>
            <p className="text-white familjen-grotesk-400">
              {result.lastHost || "-"}
            </p>
          </div>
          <div className="flex flex-row items-center justify-between">
            <p className="text-white familjen-grotesk-400">
              Quantidade de Hosts:
            </p>
            <p className="text-white familjen-grotesk-400">
              {result.numHosts || "-"}
            </p>
          </div>
          <hr className="mt-2 mb-2" />
          <div className="grid place-items-center">
            <p className="text-white familjen-grotesk-700">IP em Binário:</p>
            <p className="text-white familjen-grotesk-400">
              {result.ipBinary || "-"}
            </p>
          </div>
        </div>
        <hr className="mt-2 mb-2" />
        <div>
          <h3 className="text-white familjen-grotesk-400 mb-2">Subredes:</h3>
          <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-sky-500">
            {result.subnetsInfo?.map((subnet, index) => (
              <div key={index} className="mb-2 p-2 bg-[#333] rounded">
                <div className="flex flex-row items-center justify-between">
                  <p className="text-white familjen-grotesk-400">Subrede:</p>
                  <p className="text-white familjen-grotesk-400">{index + 1}</p>
                </div>
                <div className="flex flex-row items-center justify-between">
                  <p className="text-white familjen-grotesk-400">
                    Endereço de Rede:
                  </p>
                  <p className="text-white familjen-grotesk-400">
                    {subnet.subnetNetworkAddress}
                  </p>
                </div>
                <div className="flex flex-row items-center justify-between">
                  <p className="text-white familjen-grotesk-400">
                    Primeiro Host:
                  </p>
                  <p className="text-white familjen-grotesk-400">
                    {subnet.subnetFirstHost}
                  </p>
                </div>
                <div className="flex flex-row items-center justify-between">
                  <p className="text-white familjen-grotesk-400">
                    Último Host:
                  </p>
                  <p className="text-white familjen-grotesk-400">
                    {subnet.subnetLastHost}
                  </p>
                </div>
                <div className="flex flex-row items-center justify-between">
                  <p className="text-white familjen-grotesk-400">
                    Endereço de Broadcast:
                  </p>
                  <p className="text-white familjen-grotesk-400">
                    {subnet.subnetBroadcastAddress}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}