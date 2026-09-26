// LombokAlgoritma — Swift Data Structures
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
import Foundation  // ceil, log, pow, round

/// Bloom Filter — probabilistic set membership test.
/// No false negatives. Small false positive rate.
public struct BloomFilter {
    private var bits: [UInt8]
    private let m: Int  // bit array size
    private let k: Int  // hash function count

    public init(expectedItems n: Int, falsePositiveRate fpr: Double = 0.01) {
        m = Int(ceil(-Double(n) * log(fpr) / pow(log(2), 2)))
        k = max(1, Int(round(Double(m) / Double(n) * log(2))))
        bits = [UInt8](repeating: 0, count: (m + 7) / 8)
    }

    private func hashes(_ item: String) -> [Int] {
        let h1 = StringAlgo.fnv1a32(item)
        var h2: UInt32 = 0x811c9dc5
        for b in (item + "\0seed2").utf8 { h2 ^= UInt32(b); h2 = h2 &* 0x01000193 }
        // Split into typed steps: the one-line form exceeded the Swift type-checker time limit.
        // h1 + i*h2 < 2^63 for any realistic k, so this equals the previous abs(Int64(bitPattern:)) % m.
        let base = UInt64(h1)
        let step = UInt64(h2)
        let modulus = UInt64(m)
        var out: [Int] = []
        out.reserveCapacity(k)
        for i in 0..<k {
            let combined: UInt64 = base &+ UInt64(i) &* step
            out.append(Int(combined % modulus))
        }
        return out
    }

    public mutating func add(_ item: String) {
        for pos in hashes(item) { bits[pos >> 3] |= 1 << (pos & 7) }
    }

    public func has(_ item: String) -> Bool {
        hashes(item).allSatisfy { pos in (bits[pos >> 3] >> (pos & 7)) & 1 == 1 }
    }
}

/// Disjoint Set (Union-Find) — path compression + union by rank.
public struct DisjointSet {
    private var parent: [Int]
    private var rank: [UInt8]
    public private(set) var count: Int

    public init(_ n: Int) {
        parent = Array(0..<n); rank = [UInt8](repeating: 0, count: n); count = n
    }

    public mutating func find(_ x: Int) -> Int {
        if parent[x] != x { parent[x] = find(parent[x]) }
        return parent[x]
    }

    @discardableResult
    public mutating func union(_ x: Int, _ y: Int) -> Bool {
        let rx = find(x), ry = find(y)
        guard rx != ry else { return false }
        if rank[rx] < rank[ry] { parent[rx] = ry }
        else if rank[rx] > rank[ry] { parent[ry] = rx }
        else { parent[ry] = rx; rank[rx] += 1 }
        count -= 1; return true
    }

    public mutating func connected(_ x: Int, _ y: Int) -> Bool { find(x) == find(y) }
}
